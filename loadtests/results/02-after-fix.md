# Voucher redemption: after fix (Firestore transactions)

**Date:** 2026-11-18
**Environment:** Firebase emulator (functions + firestore), local
**Voucher:** `RACE-TEST-1` (single use)
**Method:** 50 concurrent POST requests to `redeem_voucher`
**Code under test:** `@firestore.transactional` wrapping read, validation, and update.

## Results
| Attempt | HTTP 200 (redeemed) | HTTP 400 (rejected) |
|---|---|---|
| 1 (50 requests) | **1** | **49** |
| 2 (50 requests) | **1** | **49** |

## Finding
Even under 50 concurrent requests, exactly one request succeeded while the remaining 49 were correctly rejected. Firestore's optimistic concurrency control automatically retried contending transactions and blocked double-redemption.
