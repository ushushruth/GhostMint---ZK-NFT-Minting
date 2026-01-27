import { createHash } from 'crypto';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';

const program_id = new PublicKey('iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy');

async function main() {
    console.log("TESTING!!!>>>>>>>>\n");

    //load wallet
    const secretKey = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secretKey));
    console.log('Wallet:', wallet.publicKey.toBase58());

    //conenct
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('Balance:', balance / 1e9, 'SOL');

    //config PDA
    const [configPda, configBump] = PublicKey.findProgramAddressSync(
        [Buffer.from('config')],
        program_id
    );
    console.log('Config PDA:', configPda.toBase58());

    //merkle root
    const merkleRoot = Buffer.from('1b98cbb6cabe1479be86494f6732a9b7b2bf8f741895aec5af9007c50435da4e', 'hex');

    //NFT metadata
    const name = 'GhostMint';
    const symbol = 'GHOST';
    const uri = 'https://example.com/ghost.json';

    //discriminator
    const discriminator = createHash('sha256').update('global:initialize').digest().slice(0, 8);
    console.log('Discriminator:', discriminator.toString('hex'));

    function encodeString(str: string): Buffer {
        const bytes = Buffer.from(str);
        const len = Buffer.alloc(4);
        len.writeUInt32LE(bytes.length, 0);
        return Buffer.concat([len, bytes]);
    }

    //instruction data
    const instructionData = Buffer.concat([
        discriminator,
        merkleRoot,
        encodeString(name),
        encodeString(symbol),
        encodeString(uri),
    ]);
    console.log('Instruction data length:', instructionData.length);

    //build instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
            { pubkey: configPda, isSigner: false, isWritable: true },
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
        ],
        programId: program_id,
        data: instructionData,
    });

    //build and send transaction
    const transaction = new Transaction().add(instruction);

    console.log('\nSending transaction...');
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet]
        );
        console.log('✅✅ ✅  SUCCESS! Transaction:', signature);
        console.log('View on explorer: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    } catch (error: any) {
        console.error('❌ Error:', error.message);
        if (error.logs) {
            console.log('Logs:', error.logs);
        }
    }
}

main();