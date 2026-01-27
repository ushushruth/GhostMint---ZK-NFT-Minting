import { NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(req: Request) {
    try {
        const { the_secret } = await req.json();

        const proofsPath = path.join(process.cwd(), 'public', 'proofs.json');
        const proofs = JSON.parse(fs.readFileSync(proofsPath, 'utf-8'));

        const pregenerated = proofs[the_secret];

        if (!pregenerated) {
            return NextResponse.json(
                { error: 'Invalid secret - no pre-generated proof available' },
                { status: 400 }
            );
        }

        return NextResponse.json({
            proof: pregenerated.proof,
            witness: pregenerated.witness
        });
    } catch (error) {
        console.error('Proof error:', error);
        return NextResponse.json(
            { error: 'Failed to get proof' },
            { status: 500 }
        );
    }
}
