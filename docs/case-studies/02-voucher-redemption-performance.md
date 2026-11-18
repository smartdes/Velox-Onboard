# Case Study 02: Eliminating Double-Redemption Race Conditions

## 1. Problem
Single-use welcome vouchers could be redeemed multiple times if a user or automated client sent simultaneous requests to `redeem_voucher`. In a production SaaS billing or promo system, non-atomic state transitions cause direct revenue leakage.

## 2. Constraints
* Serverless architecture (Python Cloud Functions v2 + Cloud Firestore).
* Zero additional paid infrastructure (no Redis or external lock manager).

## 3. Options Considered
* **Client-side button disabling:** Prevents accidental double-clicks in the UI, but offers zero protection against direct API calls or network retries.
* **Firestore Transactions (`@firestore.transactional`):** Enforces optimistic concurrency control directly at the database layer.

## 4. Decision and Why
Implemented `@firestore.transactional` inside `functions/main.py` (`_redeem_in_transaction`) alongside server-side `expiresAt` checks. If two requests read the same voucher simultaneously, Firestore commits the first and forces the second to retry, which then sees `redeemed: true` and returns HTTP `400`.

## 5. Implementation
* Transaction logic: `functions/main.py` (`_redeem_in_transaction`)
* Architectural Decision Record: `docs/architecture/adr/0003-atomic-voucher-redemption.md`
* Load test evidence: `loadtests/results/01-before-fix.md` and `loadtests/results/02-after-fix.md`

## 6. Results
Tested against the local Firebase Emulator using 50 concurrent POST requests targeting a single-use voucher (`RACE-TEST-1`):

| Metric | Before Fix (Read-Then-Write) | After Fix (`@firestore.transactional`) |
|---|---|---|
| Concurrent Requests | 50 | 50 |
| HTTP 200 (Success) | 2 (Double-redemption bug) | **1** |
| HTTP 400 (Rejected) | 48 | **49** |

## 7. What I'd Change Next
Add an idempotency key per user/order so legitimate network retries from the same user return the original `200` confirmation rather than a `400` error, and export a reusable `k6` script into `loadtests/k6/` for automated CI regression checks.
