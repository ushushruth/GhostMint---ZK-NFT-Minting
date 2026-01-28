<div align="center">

<img src="assets/mintghost.png" alt="MintGhost Logo" width="220" />

# MintGhost

**Privacy‑Preserving NFT Minting on Solana using Noir & Zero‑Knowledge Proofs**

App built for **Solana Privacy Hacks** — *Category: App built with Noir*

</div>

---

## Overview

MintGhost is a zero‑knowledge based NFT minting application on Solana.  
It allows users to mint NFTs by **proving eligibility without revealing any private data on‑chain**.

Proofs are generated **entirely in the browser** using Barretenberg (Noir's proving backend) and verified on‑chain by a Solana program.

---

## Features

- 🔒 Zero‑knowledge NFT minting with full privacy
- 🌐 **In-browser proof generation** — no CLI or server needed
- 📦 Chunked proof upload to handle Solana's transaction size limits
- ⚡ Optimized with priority fees for faster confirmation
- 🔐 Nullifier-based double-mint prevention
- 🎨 Modern, responsive frontend UI

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
├─────────────────────────────────────────────────────────────────┤
│  1. User enters secret permit                                    │
│  2. Noir circuit compiled to WASM runs in browser               │
│  3. Barretenberg generates ZK proof (~16KB)                     │
│  4. Proof chunked into 900-byte segments                        │
│  5. Chunks uploaded to Solana account (18 transactions)         │
│  6. Verify + Claim transaction mints NFT                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SOLANA DEVNET                               │
├─────────────────────────────────────────────────────────────────┤
│  • Proof account stores full proof data                         │
│  • Verify instruction checks Merkle root match                  │
│  • Nullifier PDA prevents double-minting                        │
│  • Claim instruction mints NFT to user wallet                   │
└─────────────────────────────────────────────────────────────────┘
```

### Step-by-Step Flow

1. **Connect Wallet** — User connects Phantom or other Solana wallet
2. **Enter Secret** — User provides their secret permit code
3. **Generate Proof** — Barretenberg runs in browser, generating a ~16KB proof
4. **Create Proof Account** — A new Solana account is created to store the proof
5. **Upload Proof Chunks** — Proof is split into 900-byte chunks and uploaded via multiple transactions
6. **Verify & Mint** — Single transaction verifies the proof and mints the NFT

---

## Technical Implementation

### In-Browser Proof Generation

We use **Barretenberg** (Noir's proving backend) compiled to WebAssembly for fully client-side proof generation:

```typescript
import { Noir } from '@noir-lang/noir_js';
import { BarretenbergBackend } from '@aztec/bb.js';

// Circuit and backend initialization
const circuit = await fetch('/circuit.json').then(r => r.json());
const backend = new BarretenbergBackend(circuit);
const noir = new Noir(circuit, backend);

// Generate proof with private inputs
const proof = await noir.generateProof({
    secret: userSecret,
    index: permitIndex,
    hash_path: merkleHashPath,
    root: merkleRoot
});
```

### Chunked Proof Upload

Solana transactions have a ~1232 byte limit, but our proofs are ~16KB. We solve this with chunked uploads:

```typescript
// Split proof into 900-byte chunks
const chunkSize = 900;
const totalChunks = Math.ceil(proofBytes.length / chunkSize);

// Create proof storage account
const proofAccount = Keypair.generate();
await createProofAccount(proofAccount, proofBytes.length);

// Upload each chunk
for (let i = 0; i < totalChunks; i++) {
    const chunk = proofBytes.slice(i * chunkSize, (i + 1) * chunkSize);
    await writeProofChunk(proofAccount, i * chunkSize, chunk);
}
```

### Nullifier-Based Double-Mint Prevention

Each secret generates a unique nullifier hash. The Solana program tracks used nullifiers:

```rust
#[account(
    init_if_needed,
    payer = user,
    seeds = [b"nullifier_v10", nullifier_hash.as_ref()],
    bump,
)]
pub nullifier: Account<'info, Nullifier>,

// Check if already minted
require!(ctx.accounts.nullifier.status == 0, ErrorCode::AlreadyMinted);
ctx.accounts.nullifier.status = 1;
```

---

## Quickstart

```bash
# Clone the repository
git clone https://github.com/ushushruth/GhostMint---ZK-NFT-Minting.git
cd GhostMint---ZK-NFT-Minting

# Build and deploy Solana program
anchor build
anchor deploy --provider.cluster devnet

# Run the frontend
cd frontend
npm install
npm run dev
```

App runs at: `http://localhost:3000`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Smart Contracts | Rust, Anchor Framework |
| ZK Circuits | Noir |
| Proof Generation | Barretenberg (WASM) |
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS |
| Wallet | Solana Wallet Adapter |
| Network | Solana Devnet |

---

## Project Structure

```
GhostMint---ZK-NFT-Minting/
├── frontend/
│   ├── app/
│   │   └── mint/page.tsx    # Main minting page
│   ├── lib/
│   │   └── browser_prover.ts # In-browser proof generation
│   └── public/
│       ├── circuit.json      # Compiled Noir circuit
│       └── permits.json      # Merkle tree permits
├── programs/
│   └── mintghost/
│       └── src/lib.rs        # Solana program
├── circuits/
│   └── src/main.nr           # Noir circuit
└── README.md
```

---

## Key Innovations

### 1. Browser-Based ZK Proofs
No CLI tools or server required. Users generate proofs entirely in their browser using Barretenberg WASM.

### 2. Chunked Upload Pattern
Overcome Solana's transaction size limits by splitting large proofs into multiple chunks uploaded to a dedicated account.

### 3. Privacy-First Design
- Private inputs never leave the browser
- On-chain program only sees the proof and public outputs
- Nullifier prevents double-minting without revealing which permit was used

---

## Limitations & Future Work

- [ ] On-chain proof verification (currently trusts root match)
- [ ] Reduce number of chunk transactions
- [ ] Mainnet deployment and audits
- [ ] Support for larger Merkle trees
- [ ] Improved error handling and UX

---

## License

This project is open source and licensed under the **Apache License 2.0**.
