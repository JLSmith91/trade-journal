import os
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import anthropic
from dotenv import load_dotenv
load_dotenv()
app = Flask(__name__)
CORS(app)

client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

JOURNAL_FILE = "trades.json"

def load_trades():
    if os.path.exists(JOURNAL_FILE):
        with open(JOURNAL_FILE, "r") as f:
            return json.load(f)
    return []

def save_trades(trades):
    with open(JOURNAL_FILE, "w") as f:
        json.dump(trades, f, indent=2)

def parse_trade_with_ai(description):
    prompt = f"""You are a trading journal assistant. Parse this trade description into structured data.

Trade description: "{description}"

Return ONLY a valid JSON object with no markdown or explanation:
{{
  "ticker": "SOFI",
  "direction": "long",
  "entry_price": 17.50,
  "exit_price": 18.20,
  "shares": 100,
  "pnl_dollars": 70.00,
  "pnl_percent": 4.0,
  "emotion": "confident",
  "mistake": "none",
  "followed_rules": true,
  "notes": "brief summary of the trade"
}}

Rules:
- direction must be "long" or "short"
- emotion must be one of: confident, anxious, FOMO, disciplined, frustrated, neutral
- mistake must be one of: none, entered too early, exited too late, chased, oversized, broke stop loss, revenge trade
- followed_rules is true if the trader followed their plan, false if they broke rules
- If information is missing, make reasonable assumptions based on context
- pnl_dollars should be positive for wins, negative for losses
- Return only the JSON object"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}]
    )

    text = message.content[0].text.strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)

def generate_weekly_summary(trades):
    if not trades:
        return "No trades to analyze yet."

    prompt = f"""Analyze these trades and provide a weekly trading summary:

{json.dumps(trades, indent=2)}

Provide a concise analysis covering:
1. Win rate and total P&L
2. Most common mistakes
3. Emotional patterns
4. Rule compliance
5. One key improvement to focus on

Keep it under 200 words. Be direct and actionable."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        messages=[{"role": "user", "content": prompt}]
    )

    return message.content[0].text.strip()

@app.route("/api/trades", methods=["GET"])
def get_trades():
    trades = load_trades()
    return jsonify(trades)

@app.route("/api/trades", methods=["POST"])
def add_trade():
    data = request.json
    description = data.get("description", "")

    if not description:
        return jsonify({"error": "No trade description provided"}), 400

    try:
        parsed = parse_trade_with_ai(description)
        parsed["id"] = datetime.now().isoformat()
        parsed["date"] = datetime.now().strftime("%Y-%m-%d")
        parsed["raw_description"] = description

        trades = load_trades()
        trades.append(parsed)
        save_trades(trades)

        return jsonify(parsed)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/trades/<trade_id>", methods=["DELETE"])
def delete_trade(trade_id):
    trades = load_trades()
    trades = [t for t in trades if t.get("id") != trade_id]
    save_trades(trades)
    return jsonify({"success": True})

@app.route("/api/summary", methods=["GET"])
def get_summary():
    trades = load_trades()
    summary = generate_weekly_summary(trades)
    return jsonify({"summary": summary})

@app.route("/api/stats", methods=["GET"])
def get_stats():
    trades = load_trades()
    if not trades:
        return jsonify({
            "total_trades": 0,
            "win_rate": 0,
            "total_pnl": 0,
            "avg_pnl": 0,
            "most_traded": "N/A",
            "most_common_mistake": "N/A",
            "rule_compliance": 0
        })

    wins = [t for t in trades if t.get("pnl_dollars", 0) > 0]
    total_pnl = sum(t.get("pnl_dollars", 0) for t in trades)
    tickers = [t.get("ticker", "") for t in trades]
    mistakes = [t.get("mistake", "none") for t in trades if t.get("mistake") != "none"]
    compliant = [t for t in trades if t.get("followed_rules", False)]

    return jsonify({
        "total_trades": len(trades),
        "win_rate": round(len(wins) / len(trades) * 100, 1),
        "total_pnl": round(total_pnl, 2),
        "avg_pnl": round(total_pnl / len(trades), 2),
        "most_traded": max(set(tickers), key=tickers.count) if tickers else "N/A",
        "most_common_mistake": max(set(mistakes), key=mistakes.count) if mistakes else "none",
        "rule_compliance": round(len(compliant) / len(trades) * 100, 1)
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)