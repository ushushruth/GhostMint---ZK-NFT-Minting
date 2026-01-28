'use client';
import { useState, useEffect } from 'react';
import { browserProve } from '@/lib/browser_prover';
import Link from 'next/link';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import {
    PublicKey,
    Transaction,
    TransactionInstruction,
    SystemProgram,
    Keypair,
    SYSVAR_RENT_PUBKEY,
    ComputeBudgetProgram
} from '@solana/web3.js';
import {
    TOKEN_PROGRAM_ID,
    ASSOCIATED_TOKEN_PROGRAM_ID,
    getAssociatedTokenAddress
} from '@solana/spl-token';
import { sha256 } from '@noble/hashes/sha2.js';

const program_id = new PublicKey('iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy');
const verifier_id = new PublicKey('F4ajai56YytKeKFg2mjuhAhNMPqzJLpUNrVxsoo3qnyB');

export default function MintPage() {
    const [secret, set_secret] = useState('');
    const { publicKey, signTransaction, signAllTransactions } = useWallet();
    const { connection } = useConnection();
    const [status, set_status] = useState('');
    const [loading, set_loading] = useState(false);
    const [txsignature, set_txsignature] = useState('');
    const [mounted, set_mounted] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [permits, set_permits] = useState<any>(null);

    useEffect(() => {
        fetch('/permits.json')
            .then(res => res.json())
            .then(data => set_permits(data));
    }, []);

    useEffect(() => {
        set_mounted(true);
    }, []);

    const handle_mint = async () => {
        const permit = permits?.permits.find((p: any) => p.secret === secret);
        if (!permit) {
            set_status("Invalid secret");
            return;
        }
        if (!publicKey) {
            set_status("Connect wallet first:<");
            return;
        }

        try {
            set_loading(true);
            set_status("Generating ZK proof in browser:>>>>...");
            const result = await browserProve(
                secret,
                permit.index,
                permit.hash_path,
                permits.root
            );

            const rawProof = result.proof.proof;
            const publicInputs = result.proof.publicInputs;

            const rootHex = publicInputs[0].replace('0x', '');
            const rootBytes = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
                rootBytes[i] = parseInt(rootHex.slice(i * 2, i * 2 + 2), 16);
            }


            const padding = new Uint8Array(12);
            const proofbytes = new Uint8Array(12 + 32 + rawProof.length);
            proofbytes.set(padding, 0);
            proofbytes.set(rootBytes, 12);
            proofbytes.set(rawProof, 44);

            console.log("Proof generated!", proofbytes.length, "bytes (with root prepended)");

            const secretBytes = new TextEncoder().encode(secret);
            const nullifier_hash = sha256(secretBytes);

            set_status("Building transaction...");

            const [config_pda] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                program_id
            );

            const [nullifier_pda] = PublicKey.findProgramAddressSync(
                [Buffer.from("nullifier_v10"), nullifier_hash],
                program_id
            );

            console.log("Nullifier PDA:", nullifier_pda.toString(), "Hash:", Buffer.from(nullifier_hash).toString('hex'));

            const nft_mint = Keypair.generate();
            const token_account = await getAssociatedTokenAddress(
                nft_mint.publicKey,
                publicKey
            );

            const proofAccount = Keypair.generate();

            const lamports =
                await connection.getMinimumBalanceForRentExemption(
                    proofbytes.length
                );

            const createProofAccountIx = SystemProgram.createAccount({
                fromPubkey: publicKey,
                newAccountPubkey: proofAccount.publicKey,
                space: proofbytes.length,
                lamports,
                programId: program_id,
            });

            // ============================
            const write_proof_discriminator = new Uint8Array([158, 128, 57, 75, 92, 21, 121, 193]);

            // ==========================================================
            set_status("Creating proof account...");
            const createTx = new Transaction().add(createProofAccountIx);
            createTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
            createTx.feePayer = publicKey;
            createTx.partialSign(proofAccount);

            if (!signTransaction) {
                throw new Error("Wallet does not support signing");
            }
            const signedCreateTx = await signTransaction(createTx);
            const createSig = await connection.sendRawTransaction(signedCreateTx.serialize(), { skipPreflight: true });
            await connection.confirmTransaction(createSig, 'confirmed');


            const chunkz_size = 900;
            const totalChunks = Math.ceil(proofbytes.length / chunkz_size);

            set_status(`Preparing ${totalChunks} chunk transactions...`);

            const priorityFeeIx = ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 50000,
            });

            const chunkTxs: Transaction[] = [];
            for (let i = 0; i < totalChunks; i++) {
                const offset = i * chunkz_size;
                const chunk = proofbytes.slice(offset, offset + chunkz_size);

                const offsetBytes = new Uint8Array(4);
                new DataView(offsetBytes.buffer).setUint32(0, offset, true);

                const chunkLen = new Uint8Array(4);
                new DataView(chunkLen.buffer).setUint32(0, chunk.length, true);

                const writeData = new Uint8Array([
                    ...write_proof_discriminator,
                    ...offsetBytes,
                    ...chunkLen,
                    ...chunk
                ]);

                const writeIx = new TransactionInstruction({
                    programId: program_id,
                    keys: [
                        { pubkey: publicKey, isSigner: true, isWritable: true },
                        { pubkey: proofAccount.publicKey, isSigner: false, isWritable: true },
                    ],
                    data: Buffer.from(writeData),
                });

                const writeTx = new Transaction()
                    .add(priorityFeeIx)
                    .add(writeIx);
                chunkTxs.push(writeTx);
            }

            const { blockhash: chunkBlockhash, lastValidBlockHeight: chunkLastValidBlockHeight } = await connection.getLatestBlockhash();
            chunkTxs.forEach(tx => {
                tx.recentBlockhash = chunkBlockhash;
                tx.feePayer = publicKey;
            });

            set_status("Please approve all chunk transactions in wallet...");
            if (!signAllTransactions) {
                throw new Error("Wallet does not support batch signing");
            }
            const signedChunkTxs = await signAllTransactions(chunkTxs);

            set_status("Sending all chunks...");
            const chunkSigs: string[] = [];
            for (let i = 0; i < signedChunkTxs.length; i++) {
                const sig = await connection.sendRawTransaction(signedChunkTxs[i].serialize(), {
                    skipPreflight: true,
                });
                chunkSigs.push(sig);
                set_status(`Sent chunk ${i + 1}/${totalChunks}...`);
            }

            set_status("Waiting for chunks to confirm...");
            await connection.confirmTransaction({
                blockhash: chunkBlockhash,
                lastValidBlockHeight: chunkLastValidBlockHeight,
                signature: chunkSigs[chunkSigs.length - 1],
            });

            set_status("Proof uploaded! Minting NFT...");

            // ==========================================================
            const verify_discriminator = new Uint8Array([
                217, 211, 191, 110, 144, 13, 186, 98
            ]);

            const verify_data = new Uint8Array([
                ...verify_discriminator,
                ...nullifier_hash,
            ]);

            console.log("Verify accounts:", {
                user: publicKey.toString(),
                config: config_pda.toString(),
                nullifier: nullifier_pda.toString(),
                proofAccount: proofAccount.publicKey.toString(),
                system: SystemProgram.programId.toString(),
                verifier: verifier_id.toString(),
            });

            const verify_instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: config_pda, isSigner: false, isWritable: true },
                    { pubkey: nullifier_pda, isSigner: false, isWritable: true },
                    { pubkey: proofAccount.publicKey, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: verifier_id, isSigner: false, isWritable: false },
                ],
                programId: program_id,
                data: Buffer.from(verify_data),
            });

            // ============================
            const claim_discriminator = new Uint8Array([
                6, 193, 146, 120, 48, 218, 69, 33
            ]);

            const claim_data = new Uint8Array([
                ...claim_discriminator,
                ...nullifier_hash,
            ]);

            const claim_instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: config_pda, isSigner: false, isWritable: true },
                    { pubkey: nullifier_pda, isSigner: false, isWritable: true },
                    { pubkey: nft_mint.publicKey, isSigner: true, isWritable: true },
                    { pubkey: token_account, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                    { pubkey: ASSOCIATED_TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
                    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
                ],
                programId: program_id,
                data: Buffer.from(claim_data),
            });


            // ============================
            const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
                units: 1_400_000,
            });

            // ==========================================================

            const transaction = new Transaction()
                .add(computeBudgetIx)
                .add(verify_instruction)
                .add(claim_instruction);

            const { blockhash, lastValidBlockHeight } =
                await connection.getLatestBlockhash();

            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;
            transaction.partialSign(nft_mint);

            if (!signTransaction) {
                throw new Error("Wallet does not support signing");
            }

            const signedTx = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(
                signedTx.serialize(),
                { skipPreflight: true }
            );

            await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature,
            });

            set_txsignature(signature);
            set_status("NFT Minted Successfully!");
        } catch (error: any) {
            console.error("Full error:", error);
            console.error("Error JSON:", JSON.stringify(error, null, 2));

            // Try to extract the actual error
            let msg = "";
            if (error?.logs) {
                msg = error.logs.join(" ");
            } else if (error?.message) {
                msg = error.message;
            } else if (error?.InstructionError) {
                msg = JSON.stringify(error.InstructionError);
            } else {
                msg = JSON.stringify(error);
            }

            if (
                msg.includes("0x1772") ||
                msg.includes("6002") ||
                msg.includes("AlreadyMinted") ||
                msg.includes("Custom")
            ) {
                set_status("Already minted with this secret");
            } else {
                set_status("Error: " + msg.slice(0, 120));
            }
        } finally {
            set_loading(false);
        }
    };
    return (
        <main className="min-h-screen bg-[#050508] text-white">
            {/* Liquid glass background blobs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[10%] w-[700px] h-[700px] rounded-full animate-blob-1"
                    style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 70%)', filter: 'blur(60px)' }} />
                <div className="absolute bottom-[-10%] right-[5%] w-[600px] h-[600px] rounded-full animate-blob-2"
                    style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(59,130,246,0.08) 40%, transparent 70%)', filter: 'blur(80px)' }} />
                <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] rounded-full animate-blob-3"
                    style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 60%)', filter: 'blur(60px)' }} />
            </div>

            {/* Noise texture */}
            <div className="fixed inset-0 opacity-[0.015] pointer-events-none"
                style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")' }} />

            {/* Glass Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/30 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-3 md:py-5">
                    <Link href="/" className="flex items-center gap-2 md:gap-4 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MintGhost" className="w-7 h-7 md:w-10 md:h-10" />
                        <span className="text-base md:text-xl font-semibold tracking-tight">MintGhost</span>
                    </Link>
                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link href="/" className="text-base text-zinc-400 hover:text-white transition-colors">Home</Link>
                        <Link href="/problem" className="text-base text-zinc-400 hover:text-white transition-colors">Problem</Link>
                        <Link href="/solution" className="text-base text-zinc-400 hover:text-white transition-colors">Solution</Link>
                        <Link href="/roadmap" className="text-base text-zinc-400 hover:text-white transition-colors">Roadmap</Link>
                        {mounted && <WalletMultiButton />}
                    </div>
                    {/* Mobile: Wallet + Hamburger */}
                    <div className="flex md:hidden items-center gap-2">
                        {mounted && <WalletMultiButton />}
                        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-white">
                            {mobileMenuOpen ? (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            ) : (
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                {/* Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden border-t border-white/5 bg-black/90 backdrop-blur-xl">
                        <div className="flex flex-col py-4 px-6 space-y-4">
                            <Link href="/" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Home</Link>
                            <Link href="/problem" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Problem</Link>
                            <Link href="/solution" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Solution</Link>
                            <Link href="/roadmap" onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white py-2">Roadmap</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Mint Section */}
            <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pt-20 pb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-full max-w-xl">
                    <div className="text-center mb-8 md:mb-12">
                        <h1 className="text-3xl md:text-5xl font-semibold mb-3 md:mb-4 tracking-tight">Mint Your NFT</h1>
                        <p className="text-base md:text-xl text-zinc-400">Enter your secret permit to claim your private NFT</p>
                    </div>

                    <div className="border border-white/10 backdrop-blur-xl bg-white/[0.03] p-6 md:p-10 rounded-2xl">
                        {publicKey ? (
                            <div className="mb-6 md:mb-10 pb-6 md:pb-8 border-b border-white/10">
                                <span className="text-xs md:text-sm text-zinc-500 font-medium">Wallet Connected</span>
                                <p className="text-sm md:text-lg text-violet-400 font-mono mt-2 truncate">{publicKey.toString()}</p>
                            </div>
                        ) : (
                            <div className="mb-6 md:mb-10 pb-6 md:pb-8 border-b border-white/10 text-center">
                                <p className="text-base md:text-xl text-zinc-400 mb-4 md:mb-6">Connect your wallet to continue</p>
                                {mounted && <WalletMultiButton />}
                            </div>
                        )}

                        <div className="mb-6 md:mb-8">
                            <label className="text-xs md:text-sm text-zinc-400 font-medium block mb-2 md:mb-3">
                                Secret Permit
                            </label>
                            <input
                                type="text"
                                value={secret}
                                onChange={(e) => set_secret(e.target.value)}
                                placeholder="Enter your secret"
                                className="w-full bg-black/50 border border-white/10 px-4 md:px-6 py-4 md:py-5 text-base md:text-xl focus:border-violet-500/50 focus:outline-none transition-all placeholder:text-zinc-600 font-mono backdrop-blur-sm rounded-xl"
                            />
                        </div>

                        <button
                            onClick={handle_mint}
                            disabled={!publicKey || loading || !secret}
                            className="w-full py-4 md:py-5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-base md:text-xl font-semibold transition-all disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20 rounded-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2 md:gap-3">
                                    <span className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="text-sm md:text-base">{status}</span>
                                </span>
                            ) : 'Verify & Mint NFT'}
                        </button>

                        {status && !loading && (
                            <div className={`mt-6 md:mt-8 p-4 md:p-5 text-center text-sm md:text-lg font-medium backdrop-blur-sm rounded-xl ${status.includes('Success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
                                status.includes('Already') || status.includes('Invalid') || status.includes('Error') ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
                                    'bg-white/5 border border-white/10 text-zinc-300'
                                }`}>
                                {status}
                            </div>
                        )}

                        {txsignature && (
                            <a
                                href={`https://explorer.solana.com/tx/${txsignature}?cluster=devnet`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block mt-4 md:mt-6 text-center text-sm md:text-lg text-violet-400 hover:text-violet-300 transition-colors font-medium"
                            >
                                View on Solana Explorer →
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob-1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(50px, -30px) scale(1.05); }
                    50% { transform: translate(20px, 40px) scale(0.95); }
                    75% { transform: translate(-30px, 20px) scale(1.02); }
                }
                @keyframes blob-2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(-40px, 30px) scale(1.03); }
                    50% { transform: translate(30px, -40px) scale(0.97); }
                    75% { transform: translate(20px, 50px) scale(1.05); }
                }
                @keyframes blob-3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-60px, -20px) scale(1.08); }
                    66% { transform: translate(40px, 30px) scale(0.92); }
                }
                .animate-blob-1 { animation: blob-1 20s ease-in-out infinite; }
                .animate-blob-2 { animation: blob-2 25s ease-in-out infinite; }
                .animate-blob-3 { animation: blob-3 18s ease-in-out infinite; }
            `}</style>
        </main>
    );
}