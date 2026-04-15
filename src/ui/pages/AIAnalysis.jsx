import React, { useState, useEffect, useCallback } from "react";
import { Brain, ShieldAlert, ShieldOff, RefreshCw, Zap } from "lucide-react";
import "../styles/AIAnalysis.css";
import { useAuth } from "../../application/auth/AuthContext";
import API_ENDPOINTS, {
  fetchWithAuth,
} from "../../infrastructure/api/api.config";

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  SHUTDOWN: {
    label: "Shutdown",
    color: "var(--color-danger, #e53935)",
    bg: "rgba(229,57,53,0.12)",
    icon: <ShieldOff size={18} />,
    pulse: true,
  },
  ALERT_ONLY: {
    label: "Alert Only",
    color: "var(--color-warning, #ff8f00)",
    bg: "rgba(255,143,0,0.12)",
    icon: <ShieldAlert size={18} />,
    pulse: false,
  },
  NORMAL: {
    label: "Normal",
    color: "var(--color-success, #32CD32)",
    bg: "rgba(50,205,50,0.10)",
    icon: <Zap size={18} />,
    pulse: false,
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.NORMAL;

// ─── Single recommendation card ─────────────────────────────────────────────
const RecommendationCard = ({ item, index }) => {
  const cfg = getStatusConfig(item.status);

  return (
    <div
      className="ai-card"
      style={{
        "--card-color": cfg.color,
        "--card-bg": cfg.bg,
        animationDelay: `${index * 80}ms`,
      }}
    >
      {cfg.pulse && <span className="ai-card__pulse" />}

      <div className="ai-card__header">
        <span className="ai-card__icon" style={{ color: cfg.color }}>
          {cfg.icon}
        </span>
        <h3 className="ai-card__name">{item.appliance || item.name}</h3>
        <span
          className="ai-card__badge"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      <p className="ai-card__recommendation">{item.recommendation}</p>
    </div>
  );
};

// ─── Main page ───────────────────────────────────────────────────────────────
export default function AIAnalysis() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { user } = useAuth();

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Adjust this endpoint to match your real backend route
      const response = await fetchWithAuth(
        `${API_ENDPOINTS.READINGS || ""}/ai-analysis`.replace("//", "/"),
      );

      if (!response.ok) throw new Error("Failed to fetch AI analysis");

      const data = await response.json();

      // Backend may return { recommendations: [...] } or plain array
      const list = Array.isArray(data) ? data : data.recommendations || [];
      setRecommendations(list);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("AI Analysis error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Derived counts ──────────────────────────────────────────────────────
  const shutdownCount = recommendations.filter(
    (r) => r.status?.toUpperCase() === "SHUTDOWN",
  ).length;
  const alertCount = recommendations.filter(
    (r) => r.status?.toUpperCase() === "ALERT_ONLY",
  ).length;

  return (
    <div className="ai-page">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="ai-page__header">
        <div className="ai-page__title-group">
          <Brain size={32} className="ai-page__brain-icon" />
          <div>
            <h1 className="ai-page__title">AI Analysis</h1>
            <p className="ai-page__subtitle">
              Smart recommendations based on your devices' live readings
            </p>
          </div>
        </div>

        <button
          className={`ai-refresh-btn ${loading ? "ai-refresh-btn--spinning" : ""}`}
          onClick={fetchRecommendations}
          disabled={loading}
          title="Refresh analysis"
        >
          <RefreshCw size={18} />
          {loading ? "Analyzing…" : "Refresh"}
        </button>
      </div>

      {/* ── Summary chips ───────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="ai-summary">
          <div className="ai-summary__chip ai-summary__chip--total">
            <span>{recommendations.length}</span> Appliances Analyzed
          </div>
          {shutdownCount > 0 && (
            <div className="ai-summary__chip ai-summary__chip--shutdown">
              <ShieldOff size={14} /> {shutdownCount} Shutdown
              {shutdownCount > 1 ? "s" : ""}
            </div>
          )}
          {alertCount > 0 && (
            <div className="ai-summary__chip ai-summary__chip--alert">
              <ShieldAlert size={14} /> {alertCount} Alert
              {alertCount > 1 ? "s" : ""}
            </div>
          )}
          {lastUpdated && (
            <span className="ai-summary__time">Updated {lastUpdated}</span>
          )}
        </div>
      )}

      {/* ── States ──────────────────────────────────────────────────────── */}
      {loading && recommendations.length === 0 && (
        <div className="ai-state">
          <div className="ai-spinner" />
          <p>Running AI analysis on your devices…</p>
        </div>
      )}

      {error && (
        <div className="ai-state ai-state--error">
          <ShieldAlert size={36} />
          <p>⚠️ {error}</p>
          <button className="ai-refresh-btn" onClick={fetchRecommendations}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="ai-state">
          <Brain size={48} style={{ opacity: 0.3 }} />
          <p>No recommendations yet.</p>
          <p style={{ fontSize: "14px", color: "#888" }}>
            Make sure your devices have active readings.
          </p>
        </div>
      )}

      {/* ── Cards grid ──────────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="ai-grid">
          {recommendations.map((item, i) => (
            <RecommendationCard
              key={item.appliance || item.name || i}
              item={item}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
