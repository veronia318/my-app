// import React, { useState, useEffect, useCallback } from "react";
// import { useLocation } from "react-router-dom";
// import {
//   Brain,
//   ShieldAlert,
//   ShieldOff,
//   RefreshCw,
//   Zap,
//   Power,
// } from "lucide-react";
// import "../styles/AIAnalysis.css";
// import { useAuth } from "../../application/auth/AuthContext";
// import API_ENDPOINTS, {
//   fetchWithAuth,
//   normalizeDevice,
// } from "../../infrastructure/api/api.config";

// // ─── Status config ──────────────────────────────────────────────────────────
// const STATUS_CONFIG = {
//   ANOMALY: {
//     label: "Anomaly",
//     color: "var(--color-danger, #e53935)",
//     bg: "rgba(229,57,53,0.12)",
//     icon: <ShieldOff size={18} />,
//     pulse: true,
//   },
//   ALERT_ONLY: {
//     label: "Alert Only",
//     color: "var(--color-warning, #ff8f00)",
//     bg: "rgba(255,143,0,0.12)",
//     icon: <ShieldAlert size={18} />,
//     pulse: false,
//   },
//   NORMAL: {
//     label: "Normal",
//     color: "var(--color-success, #32CD32)",
//     bg: "rgba(50,205,50,0.10)",
//     icon: <Zap size={18} />,
//     pulse: false,
//   },
// };

// const getStatusConfig = (status) =>
//   STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.NORMAL;

// // ─── Single recommendation card ─────────────────────────────────────────────
// // Shows the three pieces of AI info from the device's LATEST reading only:
// // status, state, and recommendation.
// const RecommendationCard = ({ item, index }) => {
//   const cfg = getStatusConfig(item.status);
//   const isOn = item.state?.toLowerCase() === "on";

//   return (
//     <div
//       className="ai-card"
//       style={{
//         "--card-color": cfg.color,
//         "--card-bg": cfg.bg,
//         animationDelay: `${index * 80}ms`,
//       }}
//     >
//       {cfg.pulse && <span className="ai-card__pulse" />}

//       <div className="ai-card__header">
//         <span className="ai-card__icon" style={{ color: cfg.color }}>
//           {cfg.icon}
//         </span>
//         <h3 className="ai-card__name">{item.name}</h3>
//         <span
//           className="ai-card__badge"
//           style={{ color: cfg.color, background: cfg.bg }}
//         >
//           {cfg.label}
//         </span>
//       </div>

//       {/* AI-suggested device state from the latest reading */}
//       <div className="ai-card__state-row">
//         <Power size={14} />
//         <span>
//           Suggested state:{" "}
//           <strong
//             style={{
//               color: isOn
//                 ? "var(--color-success, #32CD32)"
//                 : "var(--color-danger, #e53935)",
//             }}
//           >
//             {item.state ? item.state.toUpperCase() : "N/A"}
//           </strong>
//         </span>
//       </div>

//       <p className="ai-card__recommendation">
//         {item.recommendation || "No recommendation available yet."}
//       </p>
//     </div>
//   );
// };

// // ─── Main page ───────────────────────────────────────────────────────────────
// export default function AIAnalysis() {
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [lastUpdated, setLastUpdated] = useState(null);
//   const { user } = useAuth();
//   const location = useLocation();
//   const deviceId = new URLSearchParams(location.search).get("deviceId");

//   // Build the AI info for one device from its MOST RECENT reading only
//   // (no averaging/history across multiple readings):
//   //   - status         → aiPrediction.status         (Normal / Anomaly)
//   //   - state          → aiPrediction.state           (on / off suggestion)
//   //   - recommendation → aiPrediction.recommendation
//   const buildDeviceAiInfo = async (device) => {
//     const deviceId = device._id || device.id;
//     const res = await fetchWithAuth(API_ENDPOINTS.READING_BY_DEVICE(deviceId));
//     if (!res.ok) {
//       return {
//         name: device.name,
//         status: "Normal",
//         state: null,
//         recommendation: null,
//       };
//     }

//     const data = await res.json();
//     const readings = Array.isArray(data) ? data : data.readings || [];
//     const latest = readings[0];
//     const aiPrediction = latest?.aiPrediction;

//     const status =
//       aiPrediction?.status?.toLowerCase() === "anomaly" ? "Anomaly" : "Normal";

//     return {
//       name: device.name,
//       status,
//       state: aiPrediction?.state || null,
//       recommendation: aiPrediction?.recommendation || null,
//     };
//   };

//   const fetchRecommendations = useCallback(async () => {
//     if (!user) return;
//     setLoading(true);
//     setError(null);

//     try {
//       // Get the device list (filtered down to a single device if deviceId is in the URL)
//       const devicesRes = await fetchWithAuth(API_ENDPOINTS.DEVICES);
//       if (!devicesRes.ok) throw new Error("Failed to fetch devices");

//       const devicesData = await devicesRes.json();
//       const allDevices = Array.isArray(devicesData)
//         ? devicesData.flatMap((item) => (item.devices ? item.devices : [item]))
//         : [];

//       const targetDevices = deviceId
//         ? allDevices.filter((d) => (d._id || d.id) === deviceId)
//         : allDevices;

//       const normalized = targetDevices.map(normalizeDevice);

//       const aiInfoList = await Promise.all(
//         normalized.map((device) => buildDeviceAiInfo(device)),
//       );

//       setRecommendations(aiInfoList);
//       setLastUpdated(new Date().toLocaleTimeString());
//     } catch (err) {
//       console.error("AI Analysis error:", err);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [user, deviceId]);

//   useEffect(() => {
//     fetchRecommendations();
//   }, [fetchRecommendations]);

//   // ── Derived counts ──────────────────────────────────────────────────────
//   const anomalyCount = recommendations.filter(
//     (r) => r.status?.toUpperCase() === "ANOMALY",
//   ).length;

//   return (
//     <div className="ai-page">
//       {/* ── Header ─────────────────────────────────────────────────────── */}
//       <div className="ai-page__header">
//         <div className="ai-page__title-group">
//           <Brain size={32} className="ai-page__brain-icon" />
//           <div>
//             <h1 className="ai-page__title">AI Analysis</h1>
//             <p className="ai-page__subtitle">
//               {deviceId
//                 ? "AI analysis for selected device"
//                 : "Smart recommendations based on your devices' live readings"}
//             </p>
//           </div>
//         </div>

//         <button
//           className={`ai-refresh-btn ${loading ? "ai-refresh-btn--spinning" : ""}`}
//           onClick={fetchRecommendations}
//           disabled={loading}
//           title="Refresh analysis"
//         >
//           <RefreshCw size={18} />
//           {loading ? "Analyzing…" : "Refresh"}
//         </button>
//       </div>

//       {/* ── Summary chips ───────────────────────────────────────────────── */}
//       {recommendations.length > 0 && (
//         <div className="ai-summary">
//           <div className="ai-summary__chip ai-summary__chip--total">
//             <span>{recommendations.length}</span> Appliances Analyzed
//           </div>
//           {anomalyCount > 0 && (
//             <div className="ai-summary__chip ai-summary__chip--shutdown">
//               <ShieldOff size={14} /> {anomalyCount} Anomal
//               {anomalyCount > 1 ? "ies" : "y"} (auto shut down)
//             </div>
//           )}
//           {lastUpdated && (
//             <span className="ai-summary__time">Updated {lastUpdated}</span>
//           )}
//         </div>
//       )}

//       {/* ── States ──────────────────────────────────────────────────────── */}
//       {loading && recommendations.length === 0 && (
//         <div className="ai-state">
//           <div className="ai-spinner" />
//           <p>Running AI analysis on your devices…</p>
//         </div>
//       )}

//       {error && (
//         <div className="ai-state ai-state--error">
//           <ShieldAlert size={36} />
//           <p>⚠️ {error}</p>
//           <button className="ai-refresh-btn" onClick={fetchRecommendations}>
//             Try Again
//           </button>
//         </div>
//       )}

//       {!loading && !error && recommendations.length === 0 && (
//         <div className="ai-state">
//           <Brain size={48} style={{ opacity: 0.3 }} />
//           <p>No recommendations yet.</p>
//           <p style={{ fontSize: "14px", color: "#888" }}>
//             Make sure your devices have active readings.
//           </p>
//         </div>
//       )}

//       {/* ── Cards grid ──────────────────────────────────────────────────── */}
//       {recommendations.length > 0 && (
//         <div className="ai-grid">
//           {recommendations.map((item, i) => (
//             <RecommendationCard key={item.name || i} item={item} index={i} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import {
  Brain,
  ShieldAlert,
  ShieldOff,
  RefreshCw,
  Zap,
  Power,
} from "lucide-react";
import "../styles/AIAnalysis.css";
import { useAuth } from "../../application/auth/AuthContext";
import API_ENDPOINTS, {
  fetchWithAuth,
  normalizeDevice,
} from "../../infrastructure/api/api.config";

// ─── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  ANOMALY: {
    label: "Anomaly",
    color: "var(--color-danger)",
    bg: "var(--color-danger-soft-stronger)",
    icon: <ShieldOff size={18} />,
    pulse: true,
  },
  ALERT_ONLY: {
    label: "Alert Only",
    color: "var(--color-power)",
    bg: "var(--color-orange-soft)",
    icon: <ShieldAlert size={18} />,
    pulse: false,
  },
  NORMAL: {
    label: "Normal",
    color: "var(--color-success)",
    bg: "var(--color-success-soft)",
    icon: <Zap size={18} />,
    pulse: false,
  },
};

const getStatusConfig = (status) =>
  STATUS_CONFIG[status?.toUpperCase()] || STATUS_CONFIG.NORMAL;

// ─── Single recommendation card ─────────────────────────────────────────────
// Shows the three pieces of AI info from the device's LATEST reading only:
// status, state, and recommendation.
const RecommendationCard = ({ item, index }) => {
  const cfg = getStatusConfig(item.status);
  const isOn = item.state?.toLowerCase() === "on";

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
        <h3 className="ai-card__name">{item.name}</h3>
        <span
          className="ai-card__badge"
          style={{ color: cfg.color, background: cfg.bg }}
        >
          {cfg.label}
        </span>
      </div>

      {/* AI-suggested device state from the latest reading */}
      <div className="ai-card__state-row">
        <Power size={14} />
        <span>
          Current state:{" "}
          <strong
            style={{
              color: isOn ? "var(--color-success)" : "var(--color-danger)",
            }}
          >
            {item.state ? item.state.toUpperCase() : "N/A"}
          </strong>
        </span>
      </div>

      <p className="ai-card__recommendation">
        {item.recommendation || "No recommendation available yet."}
      </p>
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
  const location = useLocation();
  const deviceId = new URLSearchParams(location.search).get("deviceId");

  // Build the AI info for one device.
  //   - If the device is OFF → AI predictions are not evaluated at all.
  //     Always returns status "Normal", recommendation null, state "off".
  //   - If the device is ON → use the latest reading's aiPrediction.
  //     If the latest reading has no aiPrediction, search backwards through
  //     readings until a valid aiPrediction is found.
  //     If none exists at all, default to Normal / null recommendation / null state.
  const buildDeviceAiInfo = async (device) => {
    if (device.status === "OFF") {
      return {
        name: device.name,
        status: "Normal",
        state: "off",
        recommendation: null,
      };
    }

    const deviceId = device._id || device.id;
    const res = await fetchWithAuth(API_ENDPOINTS.READING_BY_DEVICE(deviceId));
    if (!res.ok) {
      return {
        name: device.name,
        status: "Normal",
        state: null,
        recommendation: null,
      };
    }

    const data = await res.json();
    const readings = Array.isArray(data) ? data : data.readings || [];

    // Readings come back newest-first. Search backwards from the latest
    // reading until we find one with a valid aiPrediction.
    const readingWithPrediction = readings.find((r) => r.aiPrediction);
    const aiPrediction = readingWithPrediction?.aiPrediction;

    const status =
      aiPrediction?.status?.toLowerCase() === "anomaly" ? "Anomaly" : "Normal";

    return {
      name: device.name,
      status: aiPrediction ? status : "Normal",
      state: aiPrediction?.state || null,
      recommendation: aiPrediction?.recommendation || null,
    };
  };

  const fetchRecommendations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Get the device list (filtered down to a single device if deviceId is in the URL)
      const devicesRes = await fetchWithAuth(API_ENDPOINTS.DEVICES);
      if (!devicesRes.ok) throw new Error("Failed to fetch devices");

      const devicesData = await devicesRes.json();
      const allDevices = Array.isArray(devicesData)
        ? devicesData.flatMap((item) => (item.devices ? item.devices : [item]))
        : [];

      const targetDevices = deviceId
        ? allDevices.filter((d) => (d._id || d.id) === deviceId)
        : allDevices;

      const normalized = targetDevices.map(normalizeDevice);

      const aiInfoList = await Promise.all(
        normalized.map((device) => buildDeviceAiInfo(device)),
      );

      setRecommendations(aiInfoList);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("AI Analysis error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, deviceId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  // ── Derived counts ──────────────────────────────────────────────────────
  const anomalyCount = recommendations.filter(
    (r) => r.status?.toUpperCase() === "ANOMALY",
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
              {deviceId
                ? "AI analysis for selected device"
                : "Smart recommendations based on your devices' live readings"}
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
          {anomalyCount > 0 && (
            <div className="ai-summary__chip ai-summary__chip--shutdown">
              <ShieldOff size={14} /> {anomalyCount} Anomal
              {anomalyCount > 1 ? "ies" : "y"}
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
          <p style={{ fontSize: "14px", color: "var(--color-text-secondary)" }}>
            Make sure your devices have active readings.
          </p>
        </div>
      )}

      {/* ── Cards grid ──────────────────────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div className="ai-grid">
          {recommendations.map((item, i) => (
            <RecommendationCard key={item.name || i} item={item} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
