import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
const CIRCUIT_PATH = '/Users/shush/Documents/mintghost';
export function generateProof(
    secret: string,
    index: number,
    hashPath: string[],
    root: string
): { proof: Buffer; witness: Buffer } {
    const proverToml = `
the_secret = "${secret}"
index = ${index}
hash_path = [${hashPath.map(h => `"${h}"`).join(', ')}]
root = "${root}"
`;
    fs.writeFileSync(path.join(CIRCUIT_PATH, 'Prover.toml'), proverToml);
    execSync('nargo prove', { cwd: CIRCUIT_PATH });
    execSync('sunspot prove --circuit-path . --proof-path mintghost.proof --witness-path mintghost.pw',
        { cwd: CIRCUIT_PATH });
    const proof = fs.readFileSync(path.join(CIRCUIT_PATH, 'mintghost.proof'));
    const witness = fs.readFileSync(path.join(CIRCUIT_PATH, 'mintghost.pw'));

    return { proof, witness };
}