import { Connection, Keypair, PublicKey, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import { createHash } from 'crypto';
import * as fs from 'fs';

const PROGRAM_ID = new PublicKey('iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy');

async function main() {
    console.log("Updating Merkle root on-chain...\n");

    // Load wallet
    const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log('Wallet:', wallet.publicKey.toBase58());

    // Connect
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    // Read generated root from sdk folder
    const permits = JSON.parse(fs.readFileSync('/Users/shush/Documents/mintghost/sdk/permits_generated.json', 'utf-8'));
    const rootHex = permits.root; // "0x..."
    const rootBytes = Buffer.from(rootHex.slice(2), 'hex');

    if (rootBytes.length !== 32) {
        throw new Error("Root must be 32 bytes, got " + rootBytes.length);
    }

    console.log("New root:", rootHex);

    // Config PDA
    const [configPda] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        PROGRAM_ID
    );
    console.log('Config PDA:', configPda.toBase58());

    // Build instruction: discriminator + merkle_root
    const discriminator = createHash('sha256').update('global:update_root').digest().slice(0, 8);
    const instructionData = Buffer.concat([discriminator, rootBytes]);

    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: true },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
    });

    // Send transaction
    const transaction = new Transaction().add(instruction);
    console.log('\nSending update_root transaction...');

    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log('✅ Root updated! TX:', signature);
        console.log('Explorer: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.logs) {
            console.log('Logs:');
            error.logs.forEach((log: string) => console.log('  ', log));
        }
    }
}

main();
