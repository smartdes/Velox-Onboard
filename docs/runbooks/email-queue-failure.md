# Runbook: Handling Email Queue Failures and Retry Backoffs

**Service:** `functions/email/`  
**Severity:** Medium / High  
**Owner:** Backend Engineering  

## Overview
The transactional email queue processes welcome emails and voucher delivery notifications asynchronously from Firestore. If SMTP/SendGrid delivery fails, messages enter an exponential backoff retry loop.

## Symptoms
* Cloud Logging alerts for `EMAIL_QUEUE_FAILURE` exceeding threshold ( > 5 errors in 10 minutes).
* Users reporting delayed welcome emails or missing 10% discount vouchers.

## Diagnostics
1. **Check Cloud Functions Logs:**
   ```bash
   gcloud logging read "resource.type=cloud_function AND resource.labels.function_name=process_email_queue" --limit=50 --format="table(timestamp, severity, textPayload)"

---

### Step 27: Create Analytics Pipeline Script

Add a lightweight pipeline script in `analytics/export_events.py` that demonstrates how Firestore user lifecycle events are exported for business intelligence:

```bash
cat > analytics/export_events.py << 'EOF'
"""
Analytics Export Pipeline: Firestore -> BigQuery Schema Simulation
Demonstrates event extraction for user registration and voucher redemptions.
"""

import json
from datetime import datetime, timezone

def export_mock_events():
    mock_events = [
        {
            "event_id": "evt_001",
            "event_type": "user_onboarded",
            "user_id": "usr_alpha_99",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {"source": "web_signup", "voucher_issued": True}
        },
        {
            "event_id": "evt_002",
            "event_type": "voucher_redeemed",
            "user_id": "usr_alpha_99",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": {"discount_percent": 10, "code": "WELCOME10"}
        }
    ]
    
    print(f"[{datetime.now(timezone.utc)}] Exported {len(mock_events)} events to analytics warehouse.")
    return json.dumps(mock_events, indent=2)

if __name__ == "__main__":
    print(export_mock_events())
