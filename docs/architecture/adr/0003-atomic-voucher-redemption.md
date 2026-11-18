# ADR 0003: Atomic voucher redemption

- **Status:** Proposed (implementation pending)
- **Date:** 2026-11-18

## Context

`redeem_voucher` currently reads the voucher, checks `redeemed`, and then updates it in separate calls. Two requests that arrive at the same moment can both read `redeemed = false`, both pass the check, and both succeed. A single-use voucher can then be redeemed twice.

The function also never checks `expiresAt`, so expired vouchers can still be redeemed.

## Options considered

| Option | Pros | Cons |
|---|---|---|
| Keep read-then-write (current) | Simplest code | Race condition, allows double redemption |
| Firestore transaction | Read, validate and write happen as one unit; Firestore retries on contention; no extra infrastructure | Slightly more code; per-document write rate limits apply |
| Conditional update via a separate lock or queue | Serializes all redemptions | Extra infrastructure and complexity for a problem a transaction already solves |

## Decision

Use a Firestore transaction. Inside it:

1. Read the voucher document.
2. Reject if it does not exist, is already redeemed, or `expiresAt` has passed.
3. Set `redeemed = true` and `redeemedAt`.

## Consequences

- Concurrent redemptions of the same code: exactly one succeeds, the others get "already redeemed".
- Expired vouchers are rejected with a clear error.
- Each voucher is its own document, so redemptions of different vouchers do not contend with each other.

## Verification plan

Run a k6 test that fires many parallel requests at the same code against the emulator. Record how many succeed before the fix (expected: more than one) and after (expected: exactly one). Results go in `loadtests/results/`.
