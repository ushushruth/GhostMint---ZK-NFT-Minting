# GhostMint

## Category
App built with Noir

---

## Quickstart

```bash
git clone https://github.com/ushushruth/GhostMint---ZK-NFT-Minting.git
cd GhostMint---ZK-NFT-Minting
anchor build
anchor deploy
sh generate_all_proofs.sh
cd frontend
npm install
npm run dev
```

The application will be available at:
```
http://localhost:3000
```

---

## Short Description

GhostMint is a privacy-preserving NFT minting application on Solana built using zero-knowledge proofs with Noir.
Users can mint NFTs by proving eligibility without revealing private inputs or minting conditions on-chain.

The project demonstrates a complete zero-knowledge NFT workflow, combining off-chain proof generation with on-chain verification.

---

## Demo Flow

```bash
# Connect wallet
# Generate proof locally
# Submit proof to Solana program
# Mint NFT on successful verification
```

1. User connects a Solana wallet through the frontend  
2. User provides private input required by the Noir circuit  
3. A zero-knowledge proof is generated locally  
4. Proof is submitted to the Solana program  
5. The program verifies the proof  
6. NFT is minted if verification succeeds  

Private inputs are never revealed on-chain.

---

## How It Works

- Noir defines the privacy logic
- Sunspot handles proof generation and verification
- Solana program enforces minting rules on-chain
- Frontend acts as a thin interaction layer

---

## Proof Generation (Sunspot)

Sunspot is used for proving and verifying Noir circuits on Solana.
Proofs are generated locally using Sunspot CLI binaries from the cloned repository.

```bash
git clone https://github.com/reilabs/sunspot.git
```

```bash
sunspot compile circuit.json
sunspot setup circuit.ccs
sunspot prove circuit.json witness.gz circuit.ccs proving_key.pk
sunspot verify verifying_key.vk proof.proof public_witness.pw
```

---

## Environment Variables

Create `frontend/.env.local`

```bash
NEXT_PUBLIC_SOLANA_CLUSTER_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<program_id>
```

---

## Tech Stack

- Solana
- Rust, Anchor
- Noir (Nargo)
- Sunspot
- React / Next.js
- Phantom Wallet

---

## Project Structure

```
GhostMint---ZK-NFT-Minting/
├── frontend/
├── programs/
│   └── mintghost/
├── sdk/
├── Prover.toml
├── generate_all_proofs.sh
├── Anchor.toml
├── Cargo.toml
└── README.md
```

---

## Limitations and Future Work

- In-browser proof generation
- Proof verification cost optimization
- Multiple Noir circuit support
- UX improvements
- Mainnet readiness

---

## Team

Shushruth U  
BTech Student  
Blockchain, Zero-Knowledge Proofs, Systems Programming
