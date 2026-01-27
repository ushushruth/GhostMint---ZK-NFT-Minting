

import { buildPoseidon } from 'circomlibjs';
import * as fs from 'fs';

const TREE_DEPTH = 20;

async function main() {
    console.log('Generating 10 secrets for MintGhost...\n');

    const poseidon = await buildPoseidon();
    const F = poseidon.F;


    const secrets: bigint[] = [];
    for (let i = 0; i < 10; i++) {

        const secret = BigInt('1188517471051689352612924843098829686452757431937321994492550002433274127787' + i);
        secrets.push(secret);
    }

    const leaves: bigint[] = [];
    for (const secret of secrets) {
        const hash = poseidon([secret]);
        leaves.push(F.toObject(hash));
    }


    const numLeaves = 1 << TREE_DEPTH;

    let currentLayer = new Array(numLeaves).fill(BigInt(0));
    for (let i = 0; i < leaves.length; i++) {
        currentLayer[i] = leaves[i];
    }


    const layers: bigint[][] = [currentLayer];


    while (currentLayer.length > 1) {
        const nextLayer: bigint[] = [];
        for (let i = 0; i < currentLayer.length; i += 2) {
            const left = currentLayer[i];
            const right = currentLayer[i + 1];
            const hash = poseidon([left, right]);
            nextLayer.push(F.toObject(hash));
        }
        currentLayer = nextLayer;
        layers.push(currentLayer);
    }

    const root = currentLayer[0];
    console.log('Merkle Root:', '0x' + root.toString(16));
    console.log('');

    const permits = [];
    for (let i = 0; i < secrets.length; i++) {
        const hashPath: string[] = [];
        let idx = i;

        for (let d = 0; d < TREE_DEPTH; d++) {
            const siblingIdx = idx % 2 === 0 ? idx + 1 : idx - 1;
            hashPath.push(layers[d][siblingIdx].toString());
            idx = Math.floor(idx / 2);
        }

        permits.push({
            secret: secrets[i].toString(),
            index: i,
            hash_path: hashPath
        });

        console.log(`Permit ${i}: secret = ${secrets[i].toString().slice(0, 20)}...`);
    }

    const output = {
        root: '0x' + root.toString(16),
        permits: permits
    };

    fs.writeFileSync('permits_generated.json', JSON.stringify(output, null, 2));
    console.log('\n✅ Saved to permits_generated.json');
    console.log('\nNext steps:');
    console.log('1. Update the merkle root on-chain');
    console.log('2. Copy permits to frontend/public/permits.json');
}

main().catch(console.error);
