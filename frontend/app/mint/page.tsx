'use client';
import { useState, useEffect } from 'react';
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
    const { publicKey, signTransaction } = useWallet();
    const { connection } = useConnection();
    const [status, set_status] = useState('');
    const [loading, set_loading] = useState(false);
    const [txsignature, set_txsignature] = useState('');
    const [mounted, set_mounted] = useState(false);
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
            set_status('Invalid secret');
            return;
        }
        if (!publicKey) {
            set_status('Connect wallet first');
            return;
        }
        try {
            set_loading(true);
            set_status('Generating ZK proof...');
            const response = await fetch('/api/prove', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    the_secret: secret,
                    index: permit.index,
                    hash_path: permit.hash_path,
                    root: permits.root
                })
            });
            const { proof: proofB64, witness: witnessB64 } = await response.json();
            const proof = Uint8Array.from(atob(proofB64), c => c.charCodeAt(0));
            const witness = Uint8Array.from(atob(witnessB64), c => c.charCodeAt(0));

            const secretBytes = new TextEncoder().encode(secret);
            const nullifier_hash = sha256(secretBytes);
            set_status('Building transaction...');

            const [config_pda] = PublicKey.findProgramAddressSync(
                [Buffer.from('config')],
                program_id
            );

            const [nullifier_pda] = PublicKey.findProgramAddressSync(
                [Buffer.from('nullifier_v7'), nullifier_hash],
                program_id
            );

            const nft_mint = Keypair.generate();
            const token_account = await getAssociatedTokenAddress(
                nft_mint.publicKey,
                publicKey
            );

            function toBytes(data: Uint8Array): Uint8Array {
                const len = new Uint8Array(4);
                new DataView(len.buffer).setUint32(0, data.length, true);
                return new Uint8Array([...len, ...data]);
            }

            const verify_discriminator = new Uint8Array([217, 211, 191, 110, 144, 13, 186, 98]);
            const verify_data = new Uint8Array([
                ...verify_discriminator,
                ...toBytes(proof),
                ...toBytes(witness),
                ...nullifier_hash,
            ]);
            const verify_instruction = new TransactionInstruction({
                keys: [
                    { pubkey: publicKey, isSigner: true, isWritable: true },
                    { pubkey: config_pda, isSigner: false, isWritable: true },
                    { pubkey: nullifier_pda, isSigner: false, isWritable: true },
                    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
                    { pubkey: verifier_id, isSigner: false, isWritable: false },
                ],
                programId: program_id,
                data: Buffer.from(verify_data),
            });

            const claim_discriminator = new Uint8Array([6, 193, 146, 120, 48, 218, 69, 33]);
            const claim_data = new Uint8Array([
                ...claim_discriminator,
                ...nullifier_hash
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

            set_status('Sending transaction...');

            const computeBudgetIx = ComputeBudgetProgram.setComputeUnitLimit({
                units: 1_400_000
            });

            const transaction = new Transaction()
                .add(computeBudgetIx)
                .add(verify_instruction)
                .add(claim_instruction);

            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = publicKey;
            transaction.partialSign(nft_mint);

            if (!signTransaction) {
                throw new Error('Wallet does not support signing');
            }
            const signedTx = await signTransaction(transaction);
            const signature = await connection.sendRawTransaction(signedTx.serialize());

            await connection.confirmTransaction({
                blockhash,
                lastValidBlockHeight,
                signature
            });

            set_txsignature(signature);
            set_status('NFT Minted Successfully!');

        }
        catch (error: any) {
            console.error('Full error:', error);
            const msg = error?.message || error?.toString() || 'Unknown error';

            if (msg.includes('0x1772') || msg.includes('6002') || msg.includes('AlreadyMinted')) {
                set_status('Already minted with this secret');
            } else {
                set_status('Error: ' + msg.slice(0, 50));
            }
        }
        finally {
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
                <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-8 py-4 md:py-5">
                    <Link href="/" className="flex items-center gap-3 md:gap-4 hover:opacity-80 transition-opacity">
                        <img src="/logo.png" alt="MintGhost" className="w-8 h-8 md:w-10 md:h-10" />
                        <span className="text-lg md:text-xl font-semibold tracking-tight">MintGhost</span>
                    </Link>
                    <div className="flex items-center gap-4 md:gap-6">
                        {mounted && <WalletMultiButton />}
                    </div>
                </div>
            </nav>

            {/* Mint Section */}
            <div className={`relative z-10 flex flex-col items-center justify-center min-h-screen px-4 md:px-8 pt-20 pb-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-full max-w-xl">
                    <div className="text-center mb-8 md:mb-12">
                        <h1 className="text-3xl md:text-5xl font-semibold mb-3 md:mb-4 tracking-tight">Mint Your NFT</h1>
                        <p className="text-base md:text-xl text-zinc-400">Enter your secret permit to claim your private NFT</p>
                    </div>

                    <div className="border border-white/10 backdrop-blur-xl bg-white/[0.03] p-6 md:p-10">
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
                                className="w-full bg-black/50 border border-white/10 px-4 md:px-6 py-4 md:py-5 text-base md:text-xl focus:border-violet-500/50 focus:outline-none transition-colors placeholder:text-zinc-600 font-mono backdrop-blur-sm"
                            />
                        </div>

                        <button
                            onClick={handle_mint}
                            disabled={!publicKey || loading || !secret}
                            className="w-full py-4 md:py-5 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-800/50 disabled:text-zinc-600 text-base md:text-xl font-semibold transition-all disabled:cursor-not-allowed hover:shadow-lg hover:shadow-violet-500/20"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2 md:gap-3">
                                    <span className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span className="text-sm md:text-base">{status}</span>
                                </span>
                            ) : 'Verify & Mint NFT'}
                        </button>

                        {status && !loading && (
                            <div className={`mt-6 md:mt-8 p-4 md:p-5 text-center text-sm md:text-lg font-medium backdrop-blur-sm ${status.includes('Success') ? 'bg-green-500/10 border border-green-500/30 text-green-400' :
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
