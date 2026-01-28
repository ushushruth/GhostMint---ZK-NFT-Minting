import { Buffer } from 'buffer';
if (typeof window !== "undefined") {
    if (!(Buffer.prototype as any).writeBigUInt64BE) {
        (Buffer.prototype as any).writeBigUInt64BE = function (
            value: bigint,
            offset = 0
        ) {
            let v = value;
            for (let i = 7; i >= 0; i--) {
                this[offset + i] = Number(v & 0xffn);
                v >>= 8n;
            }
            return offset + 8;
        };
    }

    (window as any).Buffer = Buffer;
}

import { Noir } from "@noir-lang/noir_js";

async function loadCircuit() {
    const res = await fetch("/circuit.json");
    if (!res.ok) {
        throw new Error("Failed to load circuit");
    }
    return await res.json();
}

export async function browserProve(
    secret: string,
    index: number,
    hashpath: string[],
    root: string
) {
    const compiledCircuit = await loadCircuit();
    const noir = new Noir(compiledCircuit);

    const inputs = {
        the_secret: secret,
        index: index.toString(),
        hash_path: hashpath,
        root: root
    };
    const { UltraHonkBackend } = await import("@aztec/bb.js");
    const { witness } = await noir.execute(inputs);
    const backend = new UltraHonkBackend(compiledCircuit.bytecode);
    const proof = await backend.generateProof(witness);

    // Debug: Log proof structure
    console.log("=== PROOF STRUCTURE ===");
    console.log("proof object keys:", Object.keys(proof));
    console.log("proof.proof length:", proof.proof?.length);
    console.log("proof.proof (first 100 bytes):", proof.proof?.slice(0, 100));
    console.log("proof.publicInputs:", proof.publicInputs);
    console.log("Full proof object:", JSON.stringify(proof, (key, value) =>
        value instanceof Uint8Array ? `Uint8Array(${value.length})` : value, 2));

    const verified = await backend.verifyProof(proof);

    return {
        proof,
        verified
    };
}
