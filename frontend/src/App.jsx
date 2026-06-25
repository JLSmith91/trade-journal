import { useState, useEffect } from "react";

const API = "http://127.0.0.1:5000/api";

const COLORS = {
  bg: "#0a0a0f",
  surface: "#111118",
  surface2: "#16161f",
  border: "#1e1e2e",
  accent: "#c8a96e",
  accentDim: "#8a7040",
  green: "#4ade80",
  red: "#f87171",
  yellow: "#fbbf24",
  blue: "#60a5fa",
  muted: "#52526b",
  text: "#e2e2f0",
  textDim: "#9999b3",
};

const EMOTION_COLORS = {
  confident: COLORS.green,
  disciplined: COLORS.green,
  neutral: COLORS.textDim,
  anxious: COLORS.yellow,
  FOMO: COLORS.yellow,
  frustrated: COLORS.red,
};

export default function TradeJournal() {
  const [tab, setTab] = useState("log");
  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [logging, setLogging] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchTrades();
    fetchStats();
  }, []);

  async function fetchTrades() {
    try {
      const res = await fetch(`${API}/trades`);
      const data = await res.json();
      setTrades(data.reverse());
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchStats() {
    try {
      const res = await fetch(`${API}/stats`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    }
  }

  async function fetchSummary() {
    setSummaryLoading(true);
    setSummary("");
    try {
      const res = await fetch(`${API}/summary`);
      const data = await res.json();
      setSummary(data.summary);
    } catch (e) {
      setSummary("Error generating summary.");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function logTrade() {
    if (!description.trim()) return;
    setLogging(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API}/trades`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setDescription("");
      setSuccess(`Trade logged: ${data.ticker} ${data.direction} — P&L: $${data.pnl_dollars}`);
      fetchTrades();
      fetchStats();
    } catch (e) {
      setError(e.message);
    } finally {
      setLogging(false);
    }
  }

  async function deleteTrade(id) {
    await fetch(`${API}/trades/${encodeURIComponent(id)}`, { method: "DELETE" });
    fetchTrades();
    fetchStats();
  }

  return (
    <div style={{ minHeight: "100vh", background: COLORS.bg, color: COLORS.text, fontFamily: "'IBM Plex Mono', monospace" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&family=IBM+Plex+Sans:wght@300;400;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a0a0f; }
        textarea { resize: vertical; }
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.4} }
      `}</style>

      {/* Header */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: COLORS.surface }}>
        <div style={{ fontSize: "13px", letterSpacing: "0.2em", color: COLORS.accent, fontWeight: 600, textTransform: "uppercase" }}>⬡ Trade Journal</div>
        <div style={{ fontSize: "11px", color: COLORS.muted, letterSpacing: "0.1em" }}>
          {trades.length} trades logged
        </div>
      </div>

      {/* Stats Bar */}
      {stats && stats.total_trades > 0 && (
        <div style={{ background: COLORS.surface2, borderBottom: `1px solid ${COLORS.border}`, padding: "12px 32px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
          {[
            { label: "Total Trades", value: stats.total_trades },
            { label: "Win Rate", value: `${stats.win_rate}%`, color: stats.win_rate >= 50 ? COLORS.green : COLORS.red },
            { label: "Total P&L", value: `$${stats.total_pnl}`, color: stats.total_pnl >= 0 ? COLORS.green : COLORS.red },
            { label: "Avg P&L", value: `$${stats.avg_pnl}`, color: stats.avg_pnl >= 0 ? COLORS.green : COLORS.red },
            { label: "Rule Compliance", value: `${stats.rule_compliance}%`, color: stats.rule_compliance >= 70 ? COLORS.green : COLORS.yellow },
            { label: "Top Mistake", value: stats.most_common_mistake, color: COLORS.yellow },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div style={{ fontSize: "9px", color: COLORS.muted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
              <div style={{ fontSize: "13px", fontWeight: 600, color: color || COLORS.text }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: `1px solid ${COLORS.border}`, display: "flex", background: COLORS.surface }}>
        {["log", "history", "summary"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: "14px 28px", background: "transparent", border: "none", borderBottom: tab === t ? `2px solid ${COLORS.accent}` : "2px solid transparent", color: tab === t ? COLORS.accent : COLORS.muted, fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer" }}>
            {t === "log" ? "Log Trade" : t === "history" ? `History (${trades.length})` : "Weekly Summary"}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px" }}>

        {/* LOG TAB */}
        {tab === "log" && (
          <div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "24px", marginBottom: "24px" }}>
              <div style={{ fontSize: "11px", color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>Describe Your Trade</div>
              <div style={{ fontSize: "11px", color: COLORS.muted, marginBottom: "12px", lineHeight: "1.6" }}>
                Just describe what happened in plain English. Example: "Bought 100 shares of SOFI at 17.50, sold at 18.20. Felt confident going in but hesitated on the exit. Followed my rules."
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your trade..."
                style={{ width: "100%", minHeight: "120px", background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.text, padding: "14px", fontSize: "13px", borderRadius: "2px", fontFamily: "'IBM Plex Sans', sans-serif", lineHeight: "1.6", marginBottom: "16px" }}
              />
              <button
                onClick={logTrade}
                disabled={logging || !description.trim()}
                style={{ padding: "12px 40px", background: "transparent", border: `1px solid ${COLORS.accent}`, color: COLORS.accent, fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontFamily: "inherit" }}
              >
                {logging ? "Analyzing..." : "Log Trade"}
              </button>
            </div>

            {success && (
              <div style={{ background: "rgba(74,222,128,0.08)", border: `1px solid rgba(74,222,128,0.3)`, borderRadius: "4px", padding: "16px", color: COLORS.green, fontSize: "12px" }}>
                ✓ {success}
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(248,113,113,0.08)", border: `1px solid rgba(248,113,113,0.3)`, borderRadius: "4px", padding: "16px", color: COLORS.red, fontSize: "12px" }}>
                Error: {error}
              </div>
            )}

            {logging && (
              <div style={{ textAlign: "center", padding: "40px 0", color: COLORS.accentDim, fontSize: "12px", letterSpacing: "0.2em", animation: "pulse 1.5s ease-in-out infinite" }}>
                Parsing trade with AI...
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            {trades.length === 0 ? (
              <div style={{ textAlign: "center", color: COLORS.muted, fontSize: "12px", padding: "60px 0" }}>
                No trades logged yet. Go log your first trade.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {trades.map((trade) => (
                  <TradeCard key={trade.id} trade={trade} onDelete={() => deleteTrade(trade.id)} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUMMARY TAB */}
        {tab === "summary" && (
          <div>
            <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "24px" }}>
              <div style={{ fontSize: "11px", color: COLORS.accent, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>AI Weekly Summary</div>
              <button
                onClick={fetchSummary}
                disabled={summaryLoading || trades.length === 0}
                style={{ padding: "10px 32px", background: "transparent", border: `1px solid ${COLORS.accent}`, color: COLORS.accent, fontSize: "12px", letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontFamily: "inherit", marginBottom: "24px" }}
              >
                {summaryLoading ? "Analyzing..." : "Generate Summary"}
              </button>

              {summaryLoading && (
                <div style={{ color: COLORS.accentDim, fontSize: "12px", letterSpacing: "0.2em", animation: "pulse 1.5s ease-in-out infinite" }}>
                  Analyzing your trading patterns...
                </div>
              )}

              {summary && (
                <div style={{ fontSize: "13px", color: COLORS.text, lineHeight: "1.8", fontFamily: "'IBM Plex Sans', sans-serif", fontWeight: 300, whiteSpace: "pre-wrap" }}>
                  {summary}
                </div>
              )}

              {!summary && !summaryLoading && trades.length === 0 && (
                <div style={{ color: COLORS.muted, fontSize: "12px" }}>Log some trades first to generate a summary.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TradeCard({ trade, onDelete }) {
  const pnlColor = trade.pnl_dollars >= 0 ? COLORS.green : COLORS.red;
  const emotionColor = EMOTION_COLORS[trade.emotion] || COLORS.textDim;

  return (
    <div style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, borderRadius: "4px", padding: "20px", borderLeft: `3px solid ${pnlColor}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <div style={{ fontSize: "16px", fontWeight: 700, color: COLORS.text, marginBottom: "2px" }}>{trade.ticker}</div>
          <div style={{ fontSize: "11px", color: COLORS.muted }}>{trade.date} · {trade.direction}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: pnlColor }}>${trade.pnl_dollars}</div>
          <div style={{ fontSize: "11px", color: pnlColor }}>{trade.pnl_percent}%</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
        {[
          { label: "Entry", value: `$${trade.entry_price}` },
          { label: "Exit", value: `$${trade.exit_price}` },
          { label: "Shares", value: trade.shares },
          { label: "Rules", value: trade.followed_rules ? "✓ Followed" : "✗ Broke", color: trade.followed_rules ? COLORS.green : COLORS.red },
        ].map(({ label, value, color }) => (
          <div key={label}>
            <div style={{ fontSize: "9px", color: COLORS.muted, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "2px" }}>{label}</div>
            <div style={{ fontSize: "12px", color: color || COLORS.text, fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
        <span style={{ padding: "2px 8px", background: `${emotionColor}18`, border: `1px solid ${emotionColor}44`, color: emotionColor, fontSize: "10px", borderRadius: "2px" }}>{trade.emotion}</span>
        {trade.mistake !== "none" && (
          <span style={{ padding: "2px 8px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", color: COLORS.red, fontSize: "10px", borderRadius: "2px" }}>{trade.mistake}</span>
        )}
      </div>

      {trade.notes && (
        <div style={{ fontSize: "11px", color: COLORS.textDim, fontStyle: "italic", marginBottom: "12px", fontFamily: "'IBM Plex Sans', sans-serif" }}>{trade.notes}</div>
      )}

      <button onClick={onDelete} style={{ padding: "4px 12px", background: "transparent", border: `1px solid rgba(248,113,113,0.3)`, color: COLORS.red, fontSize: "10px", cursor: "pointer", borderRadius: "2px", fontFamily: "inherit" }}>
        Delete
      </button>
    </div>
  );
}