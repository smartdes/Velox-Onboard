import json
import random
import string
from datetime import datetime, timedelta, timezone

from firebase_admin import initialize_app, firestore
from firebase_functions import firestore_fn, https_fn, options

initialize_app()


def generate_voucher_code() -> str:
    """Create a code like WELCOME-7K2PXQ."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=6))
    return f"WELCOME-{suffix}"


@firestore_fn.on_document_created(document="users/{userId}")
def onboard_new_user(event: firestore_fn.Event[firestore_fn.DocumentSnapshot | None]) -> None:
    """Runs when a new profile is written to /users/{userId}."""
    if event.data is None:
        return

    user_id = event.params["userId"]
    profile = event.data.to_dict() or {}
    email = profile.get("email")
    name = profile.get("name", "there")

    # Guard: skip if already onboarded (keeps the function idempotent)
    if profile.get("onboarded"):
        return

    db = firestore.client()
    now = datetime.now(timezone.utc)

    # 1. Voucher, valid for 30 days
    voucher_code = generate_voucher_code()
    db.collection("vouchers").document(voucher_code).set({
        "code": voucher_code,
        "userId": user_id,
        "discountPercent": 10,
        "expiresAt": now + timedelta(days=30),
        "redeemed": False,
    })

    # 2. Default settings
    db.collection("settings").document(user_id).set({
        "theme": "light",
        "language": "en",
        "emailNotifications": True,
        "createdAt": now,
    })

    # 3. Queue the welcome email
    db.collection("mail").add({
        "to": email,
        "subject": f"Welcome, {name}!",
        "body": f"Hi {name}, thanks for signing up. "
                f"Your welcome voucher is {voucher_code} (10% off, valid 30 days).",
        "status": "queued",
        "createdAt": now,
    })

    # 4. Mark the profile as onboarded
    event.data.reference.update({
        "onboarded": True,
        "voucherCode": voucher_code,
    })

    print(f"Onboarded user {user_id} with voucher {voucher_code}")




# ---------------------------------------------------------
# Voucher redemption (atomic, see ADR 0003)
# ---------------------------------------------------------
def _json(payload: dict, status: int) -> https_fn.Response:
    return https_fn.Response(json.dumps(payload), status=status, mimetype="application/json")


@firestore.transactional
def _redeem_in_transaction(transaction, voucher_ref):
    """Read, validate and write as one unit. Returns (outcome, voucher_data)."""
    snapshot = voucher_ref.get(transaction=transaction)
    if not snapshot.exists:
        return "not_found", None

    data = snapshot.to_dict() or {}
    if data.get("redeemed"):
        return "already_redeemed", None

    expires_at = data.get("expiresAt")
    if expires_at is not None and expires_at < datetime.now(timezone.utc):
        return "expired", None

    transaction.update(voucher_ref, {
        "redeemed": True,
        "redeemedAt": datetime.now(timezone.utc),
    })
    return "ok", data


@https_fn.on_request(
    cors=options.CorsOptions(cors_origins="*", cors_methods=["POST", "OPTIONS"])
)
def redeem_voucher(req: https_fn.Request) -> https_fn.Response:
    if req.method == "OPTIONS":
        return https_fn.Response("", status=204)

    if req.method != "POST":
        return _json({"error": "Method not allowed"}, 405)

    data = req.get_json(silent=True) or {}
    code = str(data.get("code", "")).strip().upper()
    if not code:
        return _json({"error": "Voucher code is required."}, 400)

    db = firestore.client()
    voucher_ref = db.collection("vouchers").document(code)
    outcome, voucher = _redeem_in_transaction(db.transaction(), voucher_ref)

    if outcome == "not_found":
        return _json({"error": "Invalid voucher code."}, 404)
    if outcome == "already_redeemed":
        return _json({"error": "This voucher has already been redeemed!"}, 400)
    if outcome == "expired":
        return _json({"error": "This voucher has expired."}, 400)

    return _json({
        "success": True,
        "message": f"Voucher {code} successfully redeemed!",
        "discountPercent": voucher.get("discountPercent", 10),
    }, 200)
