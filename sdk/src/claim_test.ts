import { createHash } from 'crypto';
import { ComputeBudgetProgram, Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction, SYSVAR_RENT_PUBKEY } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import * as fs from 'fs';
const program_id = new PublicKey('iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy');
const [config_pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program_id
);



async function main() {
    console.log("CLAIM MINT TEST!!!!!>>>");

    const secret_key = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secret_key));
    console.log("Wallet:", wallet.publicKey.toBase58());

    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    const proof = fs.readFileSync("/Users/shush/Documents/mintghost/mintghost.proof");
    const witness = fs.readFileSync("/Users/shush/Documents/mintghost/mintghost.pw");
    const nullifier_hash = createHash('sha256').update(proof.slice(0, 64)).digest();
    console.log("Nullifier hash:", nullifier_hash.toString('hex'));

    const [nullifier_pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nullifier_v7'), nullifier_hash],
        program_id
    );
    const nft_mint = Keypair.generate();
    console.log("NFT mint:", nft_mint.publicKey.toBase58());
    const token_account = await getAssociatedTokenAddress(
        nft_mint.publicKey,
        wallet.publicKey
    );
    const discriminator = createHash('sha256').update('global:claim_nft').digest().slice(0, 8);
    console.log('Discriminator:', discriminator.toString('hex'));
    const instruction_data = Buffer.concat([
        discriminator,
        nullifier_hash,
    ]);
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
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
        data: instruction_data,
    });

    const transaction = new Transaction().add(instruction);
    console.log('\nSending CLAIM_NFT!!>>>>>');
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet, nft_mint]
        );
        console.log('✅✅✅✅ NFT CLAIMED! TX:', signature);
        console.log('NFT MINt:', nft_mint.publicKey.toBase58());
    }
    catch (error: any) {
        console.error('❌❌❌❌ NFT CLAIM FAILED!:', error.message);
        if (error.logs) error.logs.forEach((l: String) => console.log(' ', l));


    }

}
main();