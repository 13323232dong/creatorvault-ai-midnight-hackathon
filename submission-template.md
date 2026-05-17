# Hackathon Submission Template

## Project Name

CreatorVault AI

## Short Description

Privacy-preserving income proofs for creators, backed by a Compact proof registry deployed on Midnight Preprod.

## Long Description

CreatorVault AI helps creators prove income and supporter thresholds without exposing every sponsor, exact payment amount, or private revenue record.

The project combines a Next.js demo app, TypeScript proof simulation, Lace wallet connection, and a Compact proof registry contract deployed on Midnight Preprod. The public report shows only threshold results and proof metadata, while the private sponsorship ledger stays hidden.

The AI layer turns public proof results into creator-friendly reports for brands, DAOs, and grant committees.

## Problem

Creators often need to prove traction to brands, DAOs, and grant committees, but sharing full payment history exposes sponsor identities, exact income, and private business relationships.

## Solution

CreatorVault AI lets a creator prove selected facts, such as income above a threshold or enough unique supporters, while keeping the raw income ledger private. The Midnight contract provides the public proof registry, and the frontend turns the proof result into a readable report.

## Key Features

- Wallet connection
- Lace / Midnight DApp Connector integration
- Midnight Preprod deploy page
- Compact proof registry contract
- Privacy-safe proof cards
- Private vs public data explanation
- AI-generated income summary
- Creator dashboard

## Tech Stack

- Midnight Compact
- Midnight Preprod
- Lace DApp Connector
- TypeScript
- React / Next.js
- Tailwind CSS
- AI-style report generation

## Smart Contracts

- CreatorVault Compact proof registry
- Network: Midnight Preprod
- Contract address: `799d2a5a63fd3abcb8c6b892d7e46d234db66b3570e07092a78372ea96720774`
- Tx ID: `005dae86d1b76d11dcbf9391cb10d41302dd6f60ad41d91744c661a48c90d5dd11`
- Block height: `798723`

## Repository

TODO: add GitHub repo URL

## Demo

TODO: add deployed app URL

## Video

TODO: add demo video URL

## What Was Built During The Hackathon

- Deployed the CreatorVault Compact proof registry to Midnight Preprod.
- Built a deploy page that connects to Lace, generates proof/deploy transactions, and shows chain confirmation.
- Added fallback indexer verification for the case where Lace reports a submit error but the transaction is already on-chain.
- Built dashboard, sponsor, report, architecture, and deployment views for the privacy income proof demo.
- Added development notes documenting the Preprod deployment path, tDUST constraints, local chain attempts, and final successful transaction.

## Future Work

- DAO-governed withdrawal rules
- Submit demo proof results to the deployed Midnight contract from the frontend.
- Replace TypeScript proof simulation with a fuller Midnight proof workflow.
- Add multiple creator profiles and proof registry discovery.
- Add richer AI report generation from verified public proof metadata.
