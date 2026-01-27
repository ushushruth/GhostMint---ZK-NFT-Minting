import { createHash } from 'crypto';
import { ComputeBudgetProgram } from '@solana/web3.js';
import { Connection, Keypair, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from '@solana/web3.js';
import * as fs from 'fs';
import { u8 } from '@noble/hashes/utils.js';


const program_id = new PublicKey('iWckXfdhAruKcwhoBjo3cxCJC6FgiourmJLWaLtqCNy');
const [config_pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('config')],
    program_id
);


async function main() {

    console.log("mint Wwith ZK proof!!>>>>");

    //load wallet
    const secret_key = JSON.parse(fs.readFileSync(process.env.HOME + '/.config/solana/id.json', 'utf-8'));
    const wallet = Keypair.fromSecretKey(new Uint8Array(secret_key));
    console.log('Wallet:', wallet.publicKey.toBase58());

    //connect
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

    //load proof,witness
    const proof_path = '/Users/shush/Documents/mintghost/mintghost.proof';
    const witness_path = '/Users/shush/Documents/mintghost/mintghost.pw';
    const proof = fs.readFileSync(proof_path);
    const witness = fs.readFileSync(witness_path);
    console.log('Proof length:', proof.length, 'bytes');
    console.log('Witness length:', witness.length, 'bytes');

    //nullifier hash
    const nullifier_hash = createHash('sha256').update(proof.slice(0, 64)).digest();
    console.log('nullifier hash:', nullifier_hash.toString('hex'));
    //nullifier PDA
    const [nullifier_pda] = PublicKey.findProgramAddressSync(
        [Buffer.from('nullifier_v6'), nullifier_hash],
        program_id
    );
    console.log('nullifier PDA:', nullifier_pda.toBase58());





    //discriminator
    const discriminator = createHash('sha256').update('global:verify_proof').digest().slice(0, 8);
    console.log('Discriminator:', discriminator.toString('hex'));
    function encodeBytes(data: Buffer): Buffer {
        const len = Buffer.alloc(4);
        len.writeUInt32LE(data.length, 0);
        return Buffer.concat([len, data]);
    }

    const instruction_data = Buffer.concat([
        discriminator,
        encodeBytes(proof),
        encodeBytes(witness),
        nullifier_hash,
    ]);
    console.log('Instruction data length:', instruction_data.length);



    //build instruction
    const instruction = new TransactionInstruction({
        keys: [
            { pubkey: wallet.publicKey, isSigner: true, isWritable: true },//user
            { pubkey: config_pda, isSigner: false, isWritable: true },//config
            { pubkey: nullifier_pda, isSigner: false, isWritable: true },//nullifier
            { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },//system
            { pubkey: new PublicKey('F4ajai56YytKeKFg2mjuhAhNMPqzJLpUNrVxsoo3qnyB'), isSigner: false, isWritable: false },//verifier
        ],
        programId: program_id,
        data: instruction_data,
    });



    //budget calc
    const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 1400000
    });
    const addPriorityFee = ComputeBudgetProgram.setComputeUnitPrice({
        microLamports: 1
    });

    //build and send transaction
    const transaction = new Transaction().add(modifyComputeUnits).add(addPriorityFee).add(instruction);
    console.log('\nSending mint transaction!!>>>>>');
    try {
        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [wallet]
        );
        console.log('✅✅✅ MINTED! TX:', signature);
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
