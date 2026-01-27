import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';


//program ids
const mintghost_id = 'GUQM1siHmqor18Xe41DYdAwJ47sLqa5o7kuLo7TiDYVv';
const verifier_id = 'F4ajai56YytKeKFg2mjuhAhNMPqzJLpUNrVxsoo3qnyB';

//connection
export function getConnection(): Connection {
    return new Connection('https://api.devnet.solana.com', 'confirmed');

}

//load wallet
export function loadWallet(path: string): Keypair {
    const secretkey = JSON.parse(fs.readFileSync(path, 'utf-8'));
    return Keypair.fromSecretKey(new Uint8Array(secretkey));
}

//nullifier hash from proof
export function nullifierHash(proof: Buffer): Uint8Array {
    const { sha256 } = require('@noble/hashes/sha256');
    return sha256(proof.slice(0, 64));
}


export { mintghost_id, verifier_id };