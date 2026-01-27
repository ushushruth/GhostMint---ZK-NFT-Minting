import { NextResponse } from 'next/server';
import proofs from '../../../../public/proofs.json';

export async function POST(req: Request) {
    try {
        const { the_secret } = await req.json();

        const pregenerated = (proofs as Record<string, { proof: string; witness: string }>)[the_secret];

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
        return NextResponse.json(
            { error: 'Failed to get proof' },
            { status: 500 }
        );
    }
}
