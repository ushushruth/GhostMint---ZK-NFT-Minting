GhostMint
Category

App built with Noir

Short Description

GhostMint is a privacy-preserving NFT minting application on Solana built using Noir-based zero-knowledge proofs.
Users mint NFTs by proving eligibility without revealing private inputs or mint conditions on-chain.

The application demonstrates an end-to-end workflow combining Noir circuits, off-chain proof generation, and on-chain verification.

Demo

Users connect a Solana wallet through the frontend

Zero-knowledge proofs are generated locally

Proofs are submitted to a Solana program

NFTs are minted only after successful proof verification

How It Works

User connects a wallet via the frontend

User provides private input required by the Noir circuit

A zero-knowledge proof is generated locally

The proof is submitted to the Solana smart contract

The contract verifies the proof on-chain

If verification succeeds, the NFT is minted

Private inputs are never revealed on-chain.

Proof Generation and Sunspot

GhostMint uses Sunspot for proving and verifying Noir circuits on Solana.

Sunspot is currently difficult to run reliably inside the browser, so proofs are generated locally using the Sunspot CLI binaries provided in the Sunspot repository.

There is no need to install Sunspot system-wide.
The workflow is:

Clone the Sunspot repository

Use the Sunspot binaries directly from the repo

Generate proof artifacts locally

Use those artifacts in the GhostMint flow

Using Sunspot (No Local Installation)
Clone Sunspot
git clone https://github.com/reilabs/sunspot.git


All Sunspot CLI commands are run from within the cloned repository.

Generate Proofs Using Sunspot

From the Sunspot repository:

sunspot compile circuit.json
sunspot setup circuit.ccs
sunspot prove circuit.json witness.gz circuit.ccs proving_key.pk
sunspot verify verifying_key.vk proof.proof public_witness.pw


The generated proof artifacts are then consumed by the GhostMint application.

Tech Stack

Blockchain: Solana

Smart Contracts: Rust, Anchor

Zero-Knowledge Circuits: Noir (Nargo)

Proof System: Sunspot + Noir

Frontend: React / Next.js

Wallet: Phantom

Project Structure
GhostMint---ZK-NFT-Minting/
│
├── frontend/                  # Frontend application
├── programs/
│   └── mintghost/              # Solana smart contract
│
├── sdk/                        # Proof utilities
├── Prover.toml                 # Noir prover configuration
├── generate_all_proofs.sh      # Proof generation script
├── Anchor.toml                 # Anchor config
├── Cargo.toml                  # Rust workspace
└── README.md

How to Run Locally
1. Clone the Repository
git clone https://github.com/ushushruth/GhostMint---ZK-NFT-Minting.git
cd GhostMint---ZK-NFT-Minting

2. Build and Deploy the Solana Program
anchor build
anchor deploy


Save the deployed program ID.

3. Generate Zero-Knowledge Proofs

Proofs are generated using Sunspot from the cloned Sunspot repository.

sh generate_all_proofs.sh


This script assumes Sunspot binaries are available locally from the cloned repo.

4. Run the Frontend
cd frontend
npm install
npm run dev


The application runs at:

http://localhost:3000

5. Environment Variables

Create frontend/.env.local:

NEXT_PUBLIC_SOLANA_CLUSTER_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=<program_id>

Privacy Properties

Private inputs remain local

Mint conditions are not exposed on-chain

No allowlists or centralized logic

Only proofs are verified on-chain

Limitations and Future Work

In-browser proof generation once tooling matures

Proof verification cost optimization

Support for multiple Noir circuits

Improved UX around proof handling

Mainnet readiness
