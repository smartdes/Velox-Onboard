# Voucher redemption: before fix

- **Date:** 2026-11-18
- **Environment:** Firebase emulator (functions + firestore), local
- **Voucher:** `RACE-TEST-1` (single use)
- **Method:** 50 concurrent `curl` POSTs to `redeem_voucher`
- **Code under test:** read, check `redeemed`, then update (no transaction)

## Results

| Attempt | HTTP 200 (redeemed) | HTTP 400 (rejected) |
|---|---|---|
| 1 (20 requests) | 1 | 19 |
| 2 (50 requests) | 2 | 48 |

## Finding

A single-use voucher was redeemed twice in the second attempt. Expected: exactly one success. The read-check-write sequence is not atomic, so concurrent requests can both read `redeemed = false`.
