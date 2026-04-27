# 🚀 FlowMind: AI-Powered Visual Workflow Automation

FlowMind is a high-performance SaaS platform designed for visual workflow automation. It leverages AI to transform natural language into executable logic, connecting disparate services like Google Calendar, Telegram, and Crypto Trackers through a seamless, drag-and-drop visual interface.

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **🎨 Visual Canvas** | Build complex logic flows with a high-fidelity, interactive drag-and-drop editor. |
| **🤖 AI Orchestration** | Integrated with OpenAI for intelligent natural language parsing and decision making. |
| **📊 Smart Dashboard** | A premium, minimal interface for managing workflows and accessing curated templates. |
| **🔌 Real-time Sync** | Asynchronous task execution with Celery and Redis for enterprise-grade performance. |
| **🛡️ Secure Storage** | Robust data management and persistence powered by PostgreSQL. |

## 🛠️ Tech Stack

### Frontend
- **Framework:** React.js + Vite (Fast & Modern)
- **Styling:** Tailwind CSS (Premium Design System)
- **Icons:** Lucide React (Minimalist Aesthetic)

### Backend
- **API:** Flask (Python)
- **Task Queue:** Celery with Redis (Asynchronous execution)
- **Automation:** Google Service Accounts Integration
- **Database:** **PostgreSQL** (Scalable and reliable data persistence)

## 📁 Project Structure

```bash
├── frontend/          # React + Vite application
├── backend/           # Flask API & Business Logic
│   ├── app/           
│   │   ├── controllers/ # Node logic & Task handlers
│   │   └── models/      # PostgreSQL Database schemas
└── .gitignore         # Strict security for secrets & credentials
```

## 🚀 Getting Started

### 1. Clone & Setup
```bash
git clone https://github.com/SahilGajbiye/FlowMind.git
cd FlowMind
```

### 2. Backend Initialization
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### 3. Frontend Initialization
```bash
cd frontend
npm install
npm run dev
```

### 4. Background Workers
Ensure Redis is running, then start the Celery worker:
```bash
celery -A app.controllers.tasks worker --pool=solo --loglevel=info
```

## 🛡️ Security
FlowMind enforces strict security protocols. Sensitive environment variables (`.env`) and Google Service Account credentials (`credentials.json`) are explicitly ignored by version control to prevent unauthorized access.

---
Built with ❤️ by [Sahil Gajbhiye](https://github.com/SahilGajbiye)
