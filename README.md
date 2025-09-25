# WasteTrace – End-to-End Waste Tracking  

## 📌 Project Description  
**WasteTrace** is a waste management tracking system that works like a **delivery tracker for garbage**.  

- Citizens upload a photo of their waste → system generates a **Waste ID + QR code**.  
- Collectors scan the QR or enter Waste ID → upload **live photo proof** when collecting and updating progress.  
- Waste moves step by step: **Pending → Collected → At Recycling Ground → Recycled**.  
- Once recycled, citizens earn **eco-points** redeemable for vouchers/rewards.  
- Municipality gets a **live dashboard** with waste heatmaps, recycling stats, and collector performance.  

👉 In short: WasteTrace makes waste management **transparent, verifiable, and rewarding**.  

---

## 🛠 Tech Stack  
- **Frontend:** React (Lovable.dev-generated UI)  
- **Backend:** FastAPI (Python)  
- **Database:** PostgreSQL  
- **Services:**  
  - Location hook API (FastAPI) → logs GPS + timestamps of collectors  
  - Image recognition model API (FastAPI) → classifies waste type (plastic, organic, e-waste, etc.)  
  - QR Code service (Python `qrcode`)  
  - Eco-points reward system  

---

## ⚙️ Setup Instructions  

### 1. Backend (FastAPI)  

#### Create Virtual Environment  
```bash
python -m venv venv
source venv/bin/activate   # On Linux/Mac
venv\Scripts\activate      # On Windows
```

#### Install Dependencies  
You can install dependencies from `requirements.txt`:  
```bash
pip install -r requirements.txt
```

Or install manually:  
```bash
pip install fastapi uvicorn psycopg2-binary SQLAlchemy python-multipart qrcode pillow
```

#### Run Backend (Example)  
```bash
uvicorn test:app --reload
```

- `test.py` should contain your FastAPI `app`.  
- Access docs at → [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)  

---

### 2. Frontend (React)  

#### Install Dependencies  
```bash
npm install
```

#### Run Frontend  
```bash
npm start
```

Frontend will start at → [http://localhost:3000](http://localhost:3000)  

---

## 🚀 Features Implemented  
- Citizen Portal → 2-step waste photo upload → generates Waste ID + QR  
- Collector Portal → scan QR using camera, upload live proof, update progress  
- Rewards System → eco-points awarded to citizens when waste recycled  
- Municipality Dashboard → heatmap + reports with recycling % and collector stats  
- Data Integrity → GPS + timestamps logged with every action  

---

## ⚠️ Limitations (MVP Stage)  
- Voucher API is **not yet integrated** → rewards are mocked.  
- Authentication & roles are still **hardcoded** for demo purposes.  

---

## 🎯 Future Enhancements  
- Blockchain-based immutable waste logs  
- Integration with real voucher APIs (e.g., RazorpayX, Gyftr)  
- Scalable authentication & role management  
- Deployment at municipal/city scale  

---

## 👥 Team – We Bare Bugs  
- Shalvi Maheshwari  
- Laukika Shinde  
- Sarvesh Sapkal  
