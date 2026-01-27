import * as fs from 'fs';

interface PermitList {
    secret: string;
    index: number;
    hash_path: string[];
}
interface MerkleData {
    root: string;
    permitlist: PermitList[];
}


export function loadMerkleData(path: string): MerkleData {
    const data = fs.readFileSync(path, 'utf-8');
    return JSON.parse(data);
}
export type { MerkleData, PermitList };