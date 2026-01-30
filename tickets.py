from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from db import tickets_ref



router = APIRouter()

def generate_area_id(location: dict | None) -> str:
    if not location:
        return "unknown"

    lat = location.get("lat")
    lng = location.get("lng")

    if lat is None or lng is None:
        return "unknown"

    # round to cluster nearby points into same area
    return f"{round(lat, 3)}_{round(lng, 3)}"

def calculate_trucks(pending_count: int) -> int:
    """
    Simple dynamic truck allocation logic.
    You can tune these numbers later.
    """
    if pending_count >= 20:
        return 5
    elif pending_count >= 10:
        return 3
    elif pending_count >= 5:
        return 2
    elif pending_count > 0:
        return 1
    return 0


@router.post("/tickets")
def create_ticket(payload: dict):
    print("RAW PAYLOAD:", payload)

    location = payload.get("location")
    print("LOCATION RECEIVED:", location)

    area_id = generate_area_id(location)
    print("AREA ID GENERATED:", area_id)

    waste_id = f"WT-{uuid.uuid4().hex[:6].upper()}"

    ticket = {
        "wasteId": waste_id,
        "citizenId": payload.get("citizenId", "demo-citizen"),
        "classification": payload.get("classification", "unknown"),
        "status": "pending",
        "location": location,
        "areaId": area_id,   # 👈 DO NOT MOVE THIS
        "ecoPointsAwarded": 0,
        "collectorId": None,
        "proofImageUrl": None,
        "timestamps": {
            "created": datetime.utcnow().isoformat(),
            "collected": None,
            "recycled": None,
        },
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }

    print("FINAL TICKET:", ticket)

    tickets_ref.document(waste_id).set(ticket)
    return ticket

    waste_id = f"WT-{uuid.uuid4().hex[:6].upper()}"
    location = payload.get("location")
    area_id = generate_area_id(location)
    ticket = {
        "wasteId": waste_id,
        "citizenId": payload.get("citizenId", "demo-citizen"),
        "classification": payload.get("classification", "unknown"),
        "status": "pending",
        "location": location,
        "areaId": area_id,
        "ecoPointsAwarded": 0,

        # 🔽 ADDED (non-breaking)
        "collectorId": None,
        "proofImageUrl": None,
        "timestamps": {
            "created": datetime.utcnow().isoformat(),
            "collected": None,
            "recycled": None,
        },

        # existing fields (kept as-is)
        "createdAt": datetime.utcnow().isoformat(),
        "updatedAt": datetime.utcnow().isoformat(),
    }
    print("📍 LOCATION RECEIVED:", location)
    print("🗺️ AREA ID GENERATED:", area_id)

    tickets_ref.document(waste_id).set(ticket)
    return ticket


@router.get("/tickets")
def get_tickets():
    docs = tickets_ref.stream()
    return [doc.to_dict() for doc in docs]


# 🔥 NEW ENDPOINT (CRITICAL FIX)
@router.put("/tickets/{waste_id}/status")
def update_ticket_status(waste_id: str, payload: dict):
    doc_ref = tickets_ref.document(waste_id)
    doc = doc_ref.get()

    if not doc.exists:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket = doc.to_dict()
    now = datetime.utcnow().isoformat()

    status = payload.get("status")
    collector_id = payload.get("collectorId")
    proof_image = payload.get("proofImageUrl")

    if status:
        ticket["status"] = status

        if status == "collected":
            ticket["timestamps"]["collected"] = now

        if status == "recycled":
            ticket["timestamps"]["recycled"] = now
            ticket["ecoPointsAwarded"] = 15

    if collector_id:
        ticket["collectorId"] = collector_id

    if proof_image:
        ticket["proofImageUrl"] = proof_image

    ticket["updatedAt"] = now

    doc_ref.set(ticket)
    return ticket

@router.get("/areas/summary")
def area_waste_summary():
    docs = tickets_ref.stream()

    area_stats = {}

    for doc in docs:
        ticket = doc.to_dict()
        area_id = ticket.get("areaId", "unknown")

        if ticket.get("status") != "pending":
            continue

        if area_id not in area_stats:
            area_stats[area_id] = {
                "pendingWaste": 0
            }

        area_stats[area_id]["pendingWaste"] += 1

    return area_stats

@router.get("/areas/trucks")
def area_truck_assignment():
    docs = tickets_ref.stream()

    area_stats = {}

    for doc in docs:
        ticket = doc.to_dict()
        area_id = ticket.get("areaId", "unknown")

        if ticket.get("status") != "pending":
            continue

        area_stats.setdefault(area_id, 0)
        area_stats[area_id] += 1

    result = {}

    for area_id, pending_count in area_stats.items():
        result[area_id] = {
            "pendingWaste": pending_count,
            "trucksAssigned": calculate_trucks(pending_count)
        }

    return result
