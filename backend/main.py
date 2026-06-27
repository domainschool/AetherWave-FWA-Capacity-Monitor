import os
import json
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherWaveBackend")

# Load environment variables
load_dotenv()

# Initialize Gemini API
api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)
    logger.info("Gemini API successfully configured.")
else:
    logger.warning("GEMINI_API_KEY not found in environment. AI Copilot will operate in local fallback mode.")

app = FastAPI(title="AetherWave 5G FWA Telemetry Engine")

# CORS setup for React frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits all origins for testing/production deployment flexibility
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Schemas ---
class TelemetryLog(BaseModel):
    timestamp: str
    prb_utilization_pct: float
    throughput_mbps: float
    avg_cqi: float
    fwa_subscribers_active: int
    mobile_subscribers_active: int
    packet_drop_rate_pct: float

class Sector(BaseModel):
    sector_id: str
    frequency_band: str
    active_fwa_subs: int
    active_mobile_subs: int
    prb_utilization_pct: float
    avg_cqi: float
    throughput_mbps: float
    packet_drop_rate_pct: float
    traffic_trend: str
    history: List[TelemetryLog]
    acceleration_alert_level: Optional[str] = "NORMAL"

class Tower(BaseModel):
    tower_id: str
    name: str
    health_status: str
    sectors: List[Sector]

class TelemetrySubmitPayload(BaseModel):
    timestamp: str
    tower_id: str
    sector_id: str
    frequency_band: str
    fwa_subscribers_active: int
    mobile_subscribers_active: int
    prb_utilization_pct: float
    avg_cqi: float
    downlink_throughput_mbps: float
    packet_drop_rate_pct: float

class AnalysisRequest(BaseModel):
    tower_id: str
    sector_id: str
    history: List[TelemetryLog]

# --- In-Memory State Initializer ---
def generate_initial_history(base_prb: float, base_throughput: float, base_cqi: float, fwa: int, mob: int, trend: str) -> List[dict]:
    logs = []
    now = datetime.now()
    for i in range(14, -1, -1):
        time_slot = (now - timedelta(seconds=i*3)).strftime("%H:%M:%S")
        trend_factor = (14 - i) * 1.5 if trend == "rising" else 0
        prb = max(10.0, min(100.0, base_prb + trend_factor))
        cqi = max(1.0, min(15.0, base_cqi - (trend_factor * 0.1 if trend_factor > 0 else 0)))
        tp = max(10.0, base_throughput * (1 - (prb - base_prb) / 150))
        logs.append({
            "timestamp": time_slot,
            "prb_utilization_pct": round(prb, 1),
            "throughput_mbps": round(tp, 1),
            "avg_cqi": round(cqi, 1),
            "fwa_subscribers_active": fwa + (int((14-i)*1.5) if trend == "rising" else 0),
            "mobile_subscribers_active": mob,
            "packet_drop_rate_pct": round(max(0.001, (prb - 80) * 0.01 if prb > 80 else 0.005), 3)
        })
    return logs

# Prepopulate baseline towers to support cold starts without the generator running
towers_store: Dict[str, dict] = {
    "TWR-INDY-001": {
        "tower_id": "TWR-INDY-001",
        "name": "Indianapolis Downtown - Monument Circle",
        "health_status": "Healthy",
        "sectors": [
            {
                "sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 42, "active_mobile_subs": 156,
                "prb_utilization_pct": 45.2, "avg_cqi": 12.4, "throughput_mbps": 580.4, "packet_drop_rate_pct": 0.002,
                "traffic_trend": "Stable", "history": generate_initial_history(45.2, 580.4, 12.4, 42, 156, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 35, "active_mobile_subs": 180,
                "prb_utilization_pct": 52.8, "avg_cqi": 11.8, "throughput_mbps": 512.6, "packet_drop_rate_pct": 0.005,
                "traffic_trend": "Stable", "history": generate_initial_history(52.8, 512.6, 11.8, 35, 180, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)",
                "active_fwa_subs": 95, "active_mobile_subs": 110,
                "prb_utilization_pct": 68.4, "avg_cqi": 13.1, "throughput_mbps": 820.1, "packet_drop_rate_pct": 0.008,
                "traffic_trend": "Stable", "history": generate_initial_history(68.4, 820.1, 13.1, 95, 110, "stable"),
                "acceleration_alert_level": "NORMAL"
            }
        ]
    },
    "TWR-INDY-002": {
        "tower_id": "TWR-INDY-002",
        "name": "Broad Ripple Entertainment District",
        "health_status": "Warning",
        "sectors": [
            {
                "sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 80, "active_mobile_subs": 220,
                "prb_utilization_pct": 78.5, "avg_cqi": 9.4, "throughput_mbps": 340.2, "packet_drop_rate_pct": 0.018,
                "traffic_trend": "Rising", "history": generate_initial_history(72.0, 390.0, 10.2, 80, 220, "rising"),
                "acceleration_alert_level": "WARNING"
            },
            {
                "sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 62, "active_mobile_subs": 195,
                "prb_utilization_pct": 61.2, "avg_cqi": 10.9, "throughput_mbps": 420.5, "packet_drop_rate_pct": 0.007,
                "traffic_trend": "Stable", "history": generate_initial_history(61.2, 420.5, 10.9, 62, 195, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)",
                "active_fwa_subs": 110, "active_mobile_subs": 88,
                "prb_utilization_pct": 58.1, "avg_cqi": 12.8, "throughput_mbps": 760.3, "packet_drop_rate_pct": 0.004,
                "traffic_trend": "Stable", "history": generate_initial_history(58.1, 760.3, 12.8, 110, 88, "stable"),
                "acceleration_alert_level": "NORMAL"
            }
        ]
    },
    "TWR-INDY-003": {
        "tower_id": "TWR-INDY-003",
        "name": "Indianapolis International Airport",
        "health_status": "Healthy",
        "sectors": [
            {
                "sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 10, "active_mobile_subs": 340,
                "prb_utilization_pct": 49.6, "avg_cqi": 11.5, "throughput_mbps": 520.1, "packet_drop_rate_pct": 0.003,
                "traffic_trend": "Stable", "history": generate_initial_history(49.6, 520.1, 11.5, 10, 340, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 15, "active_mobile_subs": 310,
                "prb_utilization_pct": 42.4, "avg_cqi": 12.1, "throughput_mbps": 540.8, "packet_drop_rate_pct": 0.001,
                "traffic_trend": "Stable", "history": generate_initial_history(42.4, 540.8, 12.1, 15, 310, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)",
                "active_fwa_subs": 5, "active_mobile_subs": 280,
                "prb_utilization_pct": 35.8, "avg_cqi": 14.2, "throughput_mbps": 890.3, "packet_drop_rate_pct": 0.001,
                "traffic_trend": "Stable", "history": generate_initial_history(35.8, 890.3, 14.2, 5, 280, "stable"),
                "acceleration_alert_level": "NORMAL"
            }
        ]
    },
    "TWR-INDY-004": {
        "tower_id": "TWR-INDY-004",
        "name": "Carmel Suburban Residential Zone",
        "health_status": "Healthy",
        "sectors": [
            {
                "sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 124, "active_mobile_subs": 145,
                "prb_utilization_pct: ": 69.8, "avg_cqi": 10.1, "throughput_mbps": 390.4, "packet_drop_rate_pct": 0.012,
                "traffic_trend": "Stable", "history": generate_initial_history(69.8, 390.4, 10.1, 124, 145, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 132, "active_mobile_subs": 130,
                "prb_utilization_pct": 71.5, "avg_cqi": 9.8, "throughput_mbps": 370.2, "packet_drop_rate_pct": 0.014,
                "traffic_trend": "Stable", "history": generate_initial_history(71.5, 370.2, 9.8, 132, 130, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-3", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 140, "active_mobile_subs": 122,
                "prb_utilization_pct": 74.2, "avg_cqi": 9.5, "throughput_mbps": 350.6, "packet_drop_rate_pct": 0.015,
                "traffic_trend": "Rising", "history": generate_initial_history(66.0, 400.0, 10.2, 140, 122, "rising"),
                "acceleration_alert_level": "WARNING"
            }
        ]
    },
    "TWR-INDY-042": {
        "tower_id": "TWR-INDY-042",
        "name": "Fishers Master-Planned FWA Hotspot",
        "health_status": "Critical",
        "sectors": [
            {
                "sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 135, "active_mobile_subs": 190,
                "prb_utilization_pct": 76.4, "avg_cqi": 9.6, "throughput_mbps": 360.2, "packet_drop_rate_pct": 0.011,
                "traffic_trend": "Stable", "history": generate_initial_history(76.4, 360.2, 9.6, 135, 190, "stable"),
                "acceleration_alert_level": "NORMAL"
            },
            {
                "sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 142, "active_mobile_subs": 175,
                "prb_utilization_pct": 79.1, "avg_cqi": 9.3, "throughput_mbps": 330.5, "packet_drop_rate_pct": 0.014,
                "traffic_trend": "Rising", "history": generate_initial_history(72.0, 380.0, 10.1, 142, 175, "rising"),
                "acceleration_alert_level": "WARNING"
            },
            {
                "sector_id": "SEC-3", "frequency_band": "n78 (3.5GHz C-Band)",
                "active_fwa_subs": 160, "active_mobile_subs": 150,
                "prb_utilization_pct": 86.8, "avg_cqi": 7.9, "throughput_mbps": 180.4, "packet_drop_rate_pct": 0.038,
                "traffic_trend": "Accelerating", "history": generate_initial_history(74.0, 310.0, 9.2, 140, 150, "rising"),
                "acceleration_alert_level": "CRITICAL"
            }
        ]
    }
}

# Fix Carmel's SEC-1 typo in pre-populated data key
towers_store["TWR-INDY-004"]["sectors"][0]["prb_utilization_pct"] = 69.8

# --- Trend Calculation Module (Derivatives) ---
def compute_sector_metrics_and_alerts(history: List[dict]) -> tuple:
    if len(history) < 5:
        return "Stable", "NORMAL"
        
    recent = history[-5:]
    prbs = [float(x["prb_utilization_pct"]) for x in recent]
    
    # First derivative: Velocities (V = P_i - P_{i-1})
    velocities = []
    for i in range(1, len(prbs)):
        velocities.append(prbs[i] - prbs[i-1])
        
    # Second derivative: Accelerations (A = V_i - V_{i-1})
    accelerations = []
    for i in range(1, len(velocities)):
        accelerations.append(velocities[i] - velocities[i-1])
        
    # Calculate average rate of change
    avg_velocity = sum(velocities) / len(velocities)
    avg_acceleration = sum(accelerations) / len(accelerations)
    
    current_prb = prbs[-1]
    
    # Trend evaluation based on velocity and acceleration parameters
    trend = "Stable"
    if avg_velocity > 1.2 and avg_acceleration > 0.2:
        trend = "Accelerating"
    elif avg_velocity > 0.4:
        trend = "Rising"
        
    # Alert level evaluation
    alert = "NORMAL"
    if current_prb > 85.0 and trend == "Accelerating":
        alert = "CRITICAL"
    elif current_prb > 75.0 or trend == "Accelerating" or trend == "Rising":
        alert = "WARNING"
        
    return trend, alert

# --- REST Endpoints ---

@app.get("/api/telemetry", response_model=List[Tower])
def get_telemetry():
    """Retrieve full live telemetry state for all cell towers and sectors."""
    return list(towers_store.values())

@app.post("/api/telemetry/submit")
def submit_telemetry(payload: TelemetrySubmitPayload):
    """Ingest live telemetry from cell towers, calculate derivatives, and store history."""
    tower_id = payload.tower_id
    sector_id = payload.sector_id
    
    if tower_id not in towers_store:
        raise HTTPException(status_code=404, detail=f"Tower {tower_id} not registered.")
        
    tower = towers_store[tower_id]
    target_sector = None
    
    for s in tower["sectors"]:
        if s["sector_id"] == sector_id:
            target_sector = s
            break
            
    if not target_sector:
        raise HTTPException(status_code=404, detail=f"Sector {sector_id} not found on tower {tower_id}.")
        
    # Format log entry
    new_log = {
        "timestamp": payload.timestamp,
        "prb_utilization_pct": round(payload.prb_utilization_pct, 1),
        "throughput_mbps": round(payload.downlink_throughput_mbps, 1),
        "avg_cqi": round(payload.avg_cqi, 1),
        "fwa_subscribers_active": payload.fwa_subscribers_active,
        "mobile_subscribers_active": payload.mobile_subscribers_active,
        "packet_drop_rate_pct": round(payload.packet_drop_rate_pct, 3)
    }
    
    # Update current sector values
    target_sector["active_fwa_subs"] = payload.fwa_subscribers_active
    target_sector["active_mobile_subs"] = payload.mobile_subscribers_active
    target_sector["prb_utilization_pct"] = round(payload.prb_utilization_pct, 1)
    target_sector["avg_cqi"] = round(payload.avg_cqi, 1)
    target_sector["throughput_mbps"] = round(payload.downlink_throughput_mbps, 1)
    target_sector["packet_drop_rate_pct"] = round(payload.packet_drop_rate_pct, 3)
    
    # Append log and clamp history to size=15
    history = target_sector["history"]
    history.append(new_log)
    if len(history) > 15:
        history.pop(0)
    target_sector["history"] = history
    
    # Calculate rolling trend and alert thresholds
    trend, alert = compute_sector_metrics_and_alerts(history)
    target_sector["traffic_trend"] = trend
    target_sector["acceleration_alert_level"] = alert
    
    # Re-evaluate overall tower status
    health = "Healthy"
    has_critical = any(sec["prb_utilization_pct"] > 85.0 or sec["acceleration_alert_level"] == "CRITICAL" for sec in tower["sectors"])
    has_warning = any(sec["prb_utilization_pct"] > 75.0 or sec["acceleration_alert_level"] == "WARNING" for sec in tower["sectors"])
    
    if has_critical:
        health = "Critical"
    elif has_warning:
        health = "Warning"
        
    tower["health_status"] = health
    
    return {"status": "success", "sector": sector_id, "trend": trend, "alert": alert}

@app.post("/api/analyze-sector")
def analyze_sector(request: AnalysisRequest):
    """Query Gemini LLM for 5G RAN root-cause analysis and remediation recommendations."""
    if not api_key:
        # Fallback simulation logic if API key is not present in .env
        logger.info("Executing local AI analysis fallback (No key).")
        sector_id = request.sector_id
        is_crush = any(float(x.prb_utilization_pct) > 85.0 for x in request.history)
        
        if is_crush:
            return {
                "root_cause_analysis": f"**[Fallback Mode - Active FWA Congestion]**\n\nSector **{sector_id}** is suffering from physical sub-carrier block exhaustion due to static FWA router saturation during busy hours. Inter-user scheduling queue delays have pushed packet drops up.",
                "recommended_remediation": "1. Modify proportional fair scheduling exponent ($QCI=8$ vs $QCI=9$) to prioritize hand-held units.\n2. Tilt sector antennas down by -1.5 degrees to handover edge FWA clients to adjacent cell sectors."
            }
        else:
            return {
                "root_cause_analysis": f"**[Fallback Mode - Stable]**\n\nSector **{sector_id}** reports clean performance. Metrics stay well within baseline specs.",
                "recommended_remediation": "No remediation required. Maintain standard scheduler scripts."
            }

    try:
        # Format the history data nicely for LLM intake
        history_formatted = "\n".join([
            f"- TS: {log.timestamp} | PRB: {log.prb_utilization_pct}% | CQI: {log.avg_cqi} | FWA: {log.fwa_subscribers_active} | Mob: {log.mobile_subscribers_active} | TP: {log.throughput_mbps} Mbps | Drop: {log.packet_drop_rate_pct}%"
            for log in request.history
        ])
        
        prompt = f"""
        You are an expert 5G Radio Access Network (RAN) architect specializing in Fixed Wireless Access (FWA) capacity engineering.
        Analyze the following time-series telemetry logs for Sector {request.sector_id} on Tower {request.tower_id}:
        
        {history_formatted}
        
        Using your domain expertise, diagnose the performance profile. Note if the capacity exhaustion is caused by asymmetrical FWA subscribers or general handset load.
        
        Return a strict JSON payload with two distinct keys containing your markdown analysis:
        1. "root_cause_analysis": (Analyze PRB velocity/acceleration, CQI trends, and subscriber split)
        2. "recommended_remediation": (Give actionable RAN steps like scheduler adjustments, tilt changes, or carrier aggregate changes)
        
        Return ONLY the JSON payload. Do NOT wrap the JSON inside markdown blocks (e.g. do NOT return ```json ... ```).
        """
        
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                response_mime_type="application/json"
            )
        )
        
        result_json = json.loads(response.text.strip())
        return result_json
        
    except Exception as e:
        logger.error(f"Error querying Gemini API: {str(e)}")
        # Graceful fallback in case of API failure
        return {
            "root_cause_analysis": f"**[AI Diagnostics Error Fallback]**\n\nUnable to reach LLM endpoints. Telemetry profile shows sector **{request.sector_id}** is experiencing load shifts. PRB and throughput values indicate ongoing capacity demands.",
            "recommended_remediation": "1. Monitor logs for escalating PRB velocity.\n2. Review local scheduler profiles."
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
