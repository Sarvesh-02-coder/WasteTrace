# db.py
import os
import json
from google.cloud import firestore
from google.oauth2 import service_account

# =========================
# Credentials handling
# =========================

if "GOOGLE_APPLICATION_CREDENTIALS_JSON" in os.environ:
    # 🔥 Production (Render)
    credentials_info = json.loads(
        os.environ["GOOGLE_APPLICATION_CREDENTIALS_JSON"]
    )
    credentials = service_account.Credentials.from_service_account_info(
        credentials_info
    )
    db = firestore.Client(
        project=credentials_info["project_id"],
        credentials=credentials
    )
else:
    # 🧪 Local development (serviceAccountKey.json)
    db = firestore.Client()

# =========================
# Collections
# =========================
tickets_ref = db.collection("waste_tickets")
users_ref = db.collection("users")
locations_ref = db.collection("location_logs")
