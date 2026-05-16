# NexusZero
> Prove AI executed compliantly. Without revealing what it processed.

## The Problem
Medical AI systems process sensitive patient data. Hospitals need to prove compliance without exposing records. Current systems force a choice: prove it or keep it private. NexusZero eliminates that choice.

## The Solution
NexusZero uses Midnight Network's zero-knowledge proofs to verify that an AI model executed compliantly — without revealing the underlying medical data. The proof lives on-chain forever. The data never leaves the device.

## How It Works
```
User Data → [stays private] → ZK Proof Generated → Midnight Blockchain
                                                           ↓
                                                    AI reads proof
                                                           ↓
                                              Compliance insight returned
                                         (data never seen by AI or chain)
```

## Quick Start
Prerequisites: Node 18+, Midnight Compact compiler

1. `git clone {repo}`
2. `cd nexuszero`
3. `npm install`
4. `cp .env.example .env` ← fill in your keys
5. `npm run compile` ← compiles the ZK contract
6. `npm run deploy` ← deploys to Midnight TestNet
7. `npm run dev` ← starts the app at localhost:3000

## Environment Variables
```
MIDNIGHT_NETWORK=TestNet
MIDNIGHT_INDEXER_HTTP_URL=https://indexer.testnet.midnight.network/api/v1/graphql
MIDNIGHT_PROVING_SERVER_URL=https://proving.testnet.midnight.network
CONTRACT_ADDRESS=          ← filled automatically by npm run deploy
OPENAI_API_KEY=            ← optional, mock mode works without it
```

## The ZK Circuit (plain English)
The Compact contract proves:
- The AI execution happened (via private witness)
- The result was compliant (public output: true/false)
- The specific data processed (stays private, never on-chain)

The chain stores only a cryptographic commitment — not the data itself.

## Tech Stack
- Midnight Network (ZK blockchain)
- Compact (ZK smart contract language)
- Next.js + TypeScript
- OpenAI gpt-4o-mini (optional)

## Team
itxashancode, forced844-creator, mastroevan, mutayyab63, RodGomez