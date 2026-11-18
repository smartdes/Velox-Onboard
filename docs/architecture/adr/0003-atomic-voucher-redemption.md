# ADR 0003: Atomic Voucher Redemption via Firestore Transactions

**Status:** Accepted  
**Date:** 2026-11-18

## Context
Single-use promotional vouchers (`vouchers/{code}`) are redeemed via an HTTP endpoint (`redeem_voucher`). Initially, the endpoint performed a sequential read (`doc.get()`), validated `redeemed == False`, and executed `doc.update({"redeemed": True})`. Under concurrent requests (e.g., rapid double-clicks or scripted bursts), multiple requests read `redeemed == False` before the first write committed, resulting in double redemptions.

## Options Considered
1. **Non-transactional read-check-write:** Simple and fast, but vulnerable to TOCTOU (Time-of-Check to Time-of-Use) race conditions.
2. **Distributed lock (e.g., Redis):** Adds external infrastructure, operational cost, and network latency for a serverless Firebase stack.
3. **Firestore `@firestore.transactional` (Optimistic Concurrency Control):** Native to Firestore, requires zero extra infrastructure, and automatically retries if the underlying document changes between read and write.

## Decision
Use `@firestore.transactional` in Python Cloud Functions to wrap the document read, expiry validation, and status update into a single atomic unit.

## Consequences
* **Positive:** Guarantees at-most-once redemption under high concurrency; enforces server-side `expiresAt` validation cleanly.
* **Negative:** Slightly higher tail latency under extreme contention on the same document due to automatic transaction retries (acceptable since single-use vouchers have low per-key contention in normal usage).
