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
