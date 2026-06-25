<<<<<<< HEAD
# ⬡ Trade Journal

An AI-powered trading journal that parses trades from plain English, tracks performance patterns, and generates weekly summaries — built with Python, Flask, and React.

---

## What It Does

Log any trade by describing it in plain English. The AI agent extracts the structured data, stores it, and analyzes your patterns over time.

**Per trade it captures:**
- Ticker, direction (long/short), entry and exit prices
- Shares, P&L in dollars and percentage
- Emotional state (confident, anxious, FOMO, disciplined, frustrated, neutral)
- Mistake identified (entered too early, exited too late, chased, oversized, etc.)
- Rule compliance — did you follow your trading plan?

**Dashboard stats:**
- Win rate
- Total and average P&L
- Rule compliance percentage
- Most common mistake
- Most traded ticker

**AI Weekly Summary:**
- Pattern detection across all logged trades
- Emotional analysis
- Specific improvement recommendations

---

## Tech Stack

**Backend:**
- **Python** + **Flask** — REST API server
- **Anthropic Claude API** (`claude-sonnet-4-6`) — trade parsing and weekly analysis
- **JSON file storage** — persistent trade history

**Frontend:**
- **React** + **Vite** — UI framework
- **Flask-CORS** — cross-origin request handling

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js v18+
- Anthropic API key ([console.anthropic.com](https://console.anthropic.com))

### Backend Setup

```bash
git clone https://github.com/JLSmith91/trade-journal.git
cd trade-journal
python -m venv venv
venv\Scripts\activate  # Windows
pip install anthropic flask flask-cors python-dotenv
```

Create a `.env` file in the root:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Start the backend:

```bash
python app.py
```

Backend runs on `http://127.0.0.1:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## How to Use

1. Open `http://localhost:5173`
2. Describe your trade in plain English — e.g. *"Bought 100 shares of SOFI at 17.50, sold at 18.20. Felt confident, followed my rules."*
3. Hit **Log Trade** — the AI parses and stores it automatically
4. View your full trade history in the **History** tab
5. Generate an **AI Weekly Summary** to identify patterns and improvements

---

## Project Structure

```
trade-journal/
├── app.py              # Python Flask backend + AI logic
├── trades.json         # Trade storage (auto-generated)
├── .env                # API key (not committed)
├── frontend/
│   └── src/
│       └── App.jsx     # React frontend
└── requirements.txt
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trades` | Get all trades |
| POST | `/api/trades` | Log a new trade |
| DELETE | `/api/trades/<id>` | Delete a trade |
| GET | `/api/stats` | Get performance stats |
| GET | `/api/summary` | Generate AI weekly summary |

---

## Part of a Larger AI Tooling Portfolio

Trade Journal is part of a suite of AI-powered tools built for real-world use. Other projects include a pre-market trading intelligence agent and an AI job search agent.

---

## Author

**Jared Smith** — [@JLSmith91](https://github.com/JLSmith91)
=======
# trade-journal
AI-powered trading journal that parses trades from plain English, tracks patterns, and generates weekly performance summaries. Built with Python, Flask, and React.
>>>>>>> 7d0575b (Initial commit)
