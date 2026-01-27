import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const circuit_path = '/Users/shush/Documents/mintghost';
const sunspot_path = '/Users/shush/Documents/sunspot/sunspot/go';


export async function POST(req: Request) {
    const { the_secret, index, hash_path, root } = await req.json();
    const prover_toml = `the_secret = "${the_secret}"
index = ${index}
hash_path = [${hash_path.map((h: string) => `"${h}"`).join(', ')}]
root = "${root}"`;

    fs.writeFileSync(path.join(circuit_path, 'Prover.toml'), prover_toml);

    execSync('nargo execute mintghost', { cwd: circuit_path });
    execSync('./sunspot prove /Users/shush/Documents/mintghost/target/mintghost.json /Users/shush/Documents/mintghost/target/mintghost.gz /Users/shush/Documents/mintghost/target/mintghost.ccs /Users/shush/Documents/mintghost/target/mintghost.pk', { cwd: sunspot_path });

    const proof = fs.readFileSync(path.join(circuit_path, 'target/mintghost.proof'));
    const witness = fs.readFileSync(path.join(circuit_path, 'target/mintghost.pw'));
    return NextResponse.json({
        proof: proof.toString('base64'),
        witness: witness.toString('base64')
    });


}
