# Project Specifications: AetherWave (5G FWA Capacity Monitor)

This document defines the functional scope, architecture, data schemas, and deployment workflows for the **AetherWave 5G FWA Capacity Monitor**.

## 1. Input Specifications
The system accepts two primary types of inputs:
* **Interactive UI Inputs (User-Driven):**
  * Tower and Sector Selection: Clicking a cell tower to load sector metrics and charts.
  * Simulation Controls: "Reset Simulation" to baseline, "Trigger Evening Surge" on a sector, and "Apply Mitigation" (e.g., dynamic beamforming or capping FWA subscribers).
  * AI Inquiry: Clicking "Generate Engineering Plan" to request automated diagnostics.
* **Telemetry Data Stream (System-Driven):**
  * Time-series telemetry packets sent from cell towers (simulated locally or streamed to the FastAPI backend).
  * Payload Schema:
    ```json
    {
      "timestamp": "2026-06-27T20:15:00Z",
      "tower_id": "TWR-INDY-042",
      "sector_id": "SEC-3",
      "frequency_band": "n78 (3.5GHz C-Band)",
      "fwa_subscribers_active": 142,
      "mobile_subscribers_active": 310,
      "prb_utilization_pct": 89.4,
      "avg_cqi": 8.2,
      "downlink_throughput_mbps": 420.5,
      "packet_drop_rate_pct": 0.04
    }
    ```

## 2. System Workflows
The system operates across three core workflows:

### Workflow A: Real-Time Telemetry Emulation (Local & API Mode)
* **Local Mode (MVP 1):** The React frontend runs a client-side timer (every 3 seconds) that adjusts metrics for 5 mock towers and their 3 respective sectors, simulating network noise. Sector 3 of tower `TWR-INDY-042` is explicitly programmed to experience a steady traffic surge (+4% PRB per interval) to showcase the capacity crush.
* **API Mode (MVP 2):** A Python script streams mock telemetry data to a FastAPI backend. The backend computes rolling averages and alerts based on traffic acceleration (the rate of change of congestion). The frontend polls or listens to WebSockets for real-time updates.

### Workflow B: Predictive Capacity Crush Detection
* The system calculates the first derivative (Velocity) and second derivative (Acceleration) of PRB utilization:
  * $V(t) = \frac{dP}{dt}$
  * $A(t) = \frac{dV}{dt}$
* If $A(t)$ is positive over a rolling window and PRB exceeds 85%, the sector is flagged as **"CRUSH RISK DETECTED"** with an amber/red blinking animation.

### Workflow C: AI Diagnostic & Mitigation Advisor
* When a congested sector is selected, the operator can click "Generate Engineering Plan".
* The system packages the sector's historical telemetry, formats an engineering prompt, and queries an LLM (Gemini API) to generate:
  1. A root-cause analysis explaining the congestion (e.g., FWA saturation vs. channel degradation).
  2. Recommended tactical mitigations (e.g., adjusting beamforming, carrier power adjustment, or capping FWA subscriptions).
* The plan is rendered on the UI in clean markdown.

## 3. Technology Stack & Tools
* **Frontend:**
  * Framework: Vite + React + TypeScript
  * Styling: Tailwind CSS (to be confirmed by user; fallback to high-end Vanilla CSS variables)
  * Icons: Lucide React
  * Charts: Recharts (for dual-axis PRB vs. Throughput time-series graphs)
* **Backend (MVP 2):**
  * Language: Python 3.10
  * Framework: FastAPI, Uvicorn, Pydantic
  * AI SDK: Google Generative AI (Gemini 1.5/2.0 API)
* **Storage:**
  * Local React component state (MVP 1)
  * FastAPI in-memory queues (MVP 2)
  * Supabase PostgreSQL (Tier 3 Scaling)
* **Package Manager:** `pnpm` (strictly required)

## 4. Expected Outputs
* **Interactive Network Operations Center (NOC) Dashboard:** A sleek, premium dark-themed web interface optimized for network operators.
* **Real-Time Visual Alerts:** Pulsing danger indicators for sectors experiencing exponential capacity growth.
* **Time-Series Charts:** Dual-axis charts showing the relationship between spectrum saturation (PRB) and user experience (Throughput).
* **AI Action Plans:** Explanatory reports for troubleshooting congestion.

## 5. Data Storage
* **Local Mode:** Stored in React component state.
* **Backend Mode:** Kept in a rolling FIFO cache (last 15 records per sector) in memory.
* **Persistent Mode:** Stored in PostgreSQL (Supabase) with an index on `(tower_id, sector_id, timestamp DESC)`.

## 6. Deployment
* **Frontend:** Built and deployed static files to GitHub Pages via `gh-pages`. Base path configured to match the GitHub repository name.
* **Backend:** Run locally for development/testing.

## 7. Definition of "Done"
* A Vite + React + TS dashboard builds successfully without type errors.
* The frontend runs locally, displaying real-time updating mock telemetry with visual alerts, charts, and simulation controls.
* The app compiles with proper responsive design and premium glassmorphic UI aesthetics.
* The code is fully synced to GitHub, and the static site is deployed to GitHub Pages (after receiving explicit user approval).
