# 🚀 FlowMind: AI-Powered Visual Workflow Automation

FlowMind is a state-of-the-art SaaS platform designed to automate complex tasks through a high-fidelity visual canvas. Build intelligent workflows using AI-powered nodes, real-time data tracking, and seamless third-party integrations.

![Dashboard Preview](https://github.com/SahilGajbiye/FlowMind/raw/main/preview.png) 
## ✨ Key Features

- **🎨 High-Fidelity Canvas:** Drag-and-drop interface to build complex logic flows with glowing nodes and smooth connections.
- **🤖 AI-Driven Nodes:** Integrated with OpenAI for natural language parsing, summarization, and decision making.
- **📊 Premium Dashboard:** A sleek, glassmorphic dashboard to manage your workflows, browse templates, and monitor performance.
- **🔌 Diverse Integrations:**
  - **Google Calendar:** Smart event scheduling from natural language.
  - **Telegram Bot:** Real-time alerts and report delivery.
  - **Crypto Tracker:** Live price monitoring with AI analysis.
  - **Weather API:** Automated hourly weather updates.
- **🚀 One-Click Templates:** Ready-to-use workflows for daily tasks, crypto alerts, and more.

## 🛠️ Tech Stack

### Frontend
- **React.js & Vite:** For a blazing-fast user experience.
- **Tailwind CSS:** Modern, responsive, and premium UI styling.
- **Lucide React:** Sleek and minimal iconography.

### Backend
- **Flask (Python):** Lightweight and scalable API orchestration.
- **Celery & Redis:** Distributed task queue for asynchronous workflow execution.
- **Google Service Accounts:** Secure integration for enterprise-grade automation.

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/SahilGajbiye/FlowMind.git
cd FlowMind
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
flask run
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Run Celery Worker (for task execution)
```bash
cd backend
celery -A app.controllers.tasks worker --pool=solo --loglevel=info
```

## 🛡️ Security & Privacy
FlowMind is built with security in mind. Sensitive data like `credentials.json` and `.env` files are never pushed to public repositories, ensuring your API keys and secrets remain private.

---
Built with ❤️ by [Sahil Gajbhiye](https://github.com/SahilGajbiye)
