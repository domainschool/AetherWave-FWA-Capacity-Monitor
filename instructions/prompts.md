### Tier 1: MVP 1 (Local Frontend Prototype)

#### Prompt 1.1: Component Shell & Initial Layout Setup

```text
Create a single-page React component using Tailwind CSS and Lucide React icons for a Next.js App Router setup. This dashboard is a "5G FWA Capacity Crush Monitor" for telecom network engineers. 

Build a clean layout containing:
1. A top header bar with the product title "AetherWave: FWA Capacity Monitor", a simulated live clock displaying current UTC time, and a status badge stating "System Status: Local Emulation Active".
2. A two-column main layout:
   - Left Column (Width: 1/3): A sidebar containing a list of 5 simulated cell towers (e.g., TWR-INDY-001 through TWR-INDY-005). Each tower should display its ID, total active subscribers, and a dynamic color-coded health badge (Healthy, Warning, Critical).
   - Right Column (Width: 2/3): A detailed view pane that updates based on the selected tower. If no tower is selected, display an empty slate state instructing the user to "Select a cell tower from the sidebar to view sector-level real-time telemetry."

Keep all state local for now using React's useState. Use clean, professional typography suitable for an enterprise B2B infrastructure tool.

```

#### Prompt 1.2: Mock Data & Sector Detail Panel

```text
Enhance the dashboard component by defining a hardcoded local array of mock data containing 3 sectors for each of the 5 cell towers. 

Each sector object must include the following properties:
- sector_id (e.g., SEC-1, SEC-2, SEC-3)
- frequency_band (e.g., "n78 3.5GHz C-Band" or "n258 24GHz mmWave")
- active_fwa_subs (integer)
- active_mobile_subs (integer)
- prb_utilization_pct (float between 30.0 and 98.0)
- avg_cqi (float between 6.0 and 14.5)
- throughput_mbps (float between 50.0 and 850.0)
- traffic_trend ("Stable", "Rising", "Accelerating")

When a user clicks a tower in the left sidebar, render a grid layout of these 3 sectors in the right column main pane. Each sector should be rendered as a card component showing these key network indicators clearly with small descriptive sub-labels (e.g., "PRB Utilization", "Avg CQI"). If a sector has a traffic_trend of "Accelerating" and a prb_utilization_pct over 85%, render an amber or red blinking pulse animation badge labeled "CRUSH RISK DETECTED".

```

#### Prompt 1.3: Real-Time State Emulation Clock

```text
Implement an internal JavaScript interval timer within the component to simulate a live network stream using local state changes. 

Every 3 seconds, loop through the active tower and sector states and mutate the values slightly to show active network activity:
- Fluctuate the `prb_utilization_pct` by adding or subtracting a random float between -1.5% and +1.5%. Ensure the value clamps between 0% and 100%.
- Adjust `throughput_mbps` relative to the PRB change (if PRB goes up, throughput drops slightly).
- Explicitly program "TWR-INDY-042" / "SEC-3" to steadily escalate its `prb_utilization_pct` by +4.0% every interval cycle to simulate a deterministic FWA capacity crunch during evening prime-time.

Add a manual "Reset Simulation" button in the top header that reverts all data back to its original baseline state so that users can view the data cycle transition repeatedly during testing without needing a browser page refresh.

```

---

### Tier 2: MVP 2 (Live Backend, Live Calculations & AI Insights)

#### Prompt 2.1: FastAPI Telemetry & Stream Architecture Setup

```text
We are separating the frontend UI from the data engine. Create a Python backend script using FastAPI (`main.py`).

1. Define a Pydantic schema for incoming raw tower logs containing fields: `timestamp`, `tower_id`, `sector_id`, `frequency_band`, `fwa_subscribers_active`, `mobile_subscribers_active`, `prb_utilization_pct`, `avg_cqi`, and `downlink_throughput_mbps`.
2. Create an in-memory storage dictionary that keeps track of the last 15 historical telemetry entries for each tower/sector combination.
3. Build a `/api/telemetry` GET endpoint that returns the complete current status of all towers and sectors.
4. Implement an internal background routing loop calculation that assesses the first derivative (Velocity) and second derivative (Acceleration) of `prb_utilization_pct` over the stored historical records. If the acceleration metric is highly positive, append a new computed field to that sector's API payload: `"acceleration_alert_level": "CRITICAL"`.

Modify the existing Next.js frontend dashboard to fetch data from this FastAPI `/api/telemetry` endpoint every 3 seconds using standard asynchronous fetch inside a `useEffect` hook. Add skeleton loading states (shimmer effects) that render inside the component UI while waiting for the first initial network payload response.

```

#### Prompt 2.2: Generative AI Root Cause & Remediation Generator

```text
Integrate AI analysis capabilities into the solution. Add a dedicated "AI Engineer Assistant" text card panel to the bottom section of the right-hand Sector Detail view pane.

1. Create a new POST endpoint in the FastAPI backend called `/api/analyze-sector`. This endpoint accepts a historical array of the last 10 telemetry points for a single congested sector.
2. Inside this endpoint, construct a prompt for an LLM (such as Gemini or OpenAI GPT-4o) using secure environment variables (`.env`).
3. The prompt must instruct the LLM to act as an expert 5G Radio Access Network (RAN) architect. It should read the telemetry patterns (such as dropping CQI under rising FWA subscriber count) and return a strict JSON payload with two distinct markdown keys: `"root_cause_analysis"` and `"recommended_remediation"` (e.g., recommending a sector carrier power adjust, beamforming split, or FWA subscriber capping policy).
4. Add an interactive "Generate Engineering Plan" action button inside the frontend dashboard's Sector card interface. Clicking this triggers the API call, puts the specific panel into a spinning loading state, and displays the response markdown text inside the component layout when returned.

```

---

### Tier 3: Scaling for Enterprise (Persisted Database, Charts & Authentication)

#### Prompt 3.1: Supabase Database Integration & Auth Guards

```text
Scale the prototype to enterprise production grade by replacing in-memory storage with a persistent database tier using Supabase (PostgreSQL).

1. Provide the SQL schema script needed to create a `telemetry_logs` table with an automatic index applied on the `(tower_id, sector_id, timestamp DESC)` columns to optimize performance under massive telemetry loads.
2. Update the Python FastAPI application backend to append all incoming telemetry items securely into the Supabase client connection instance.
3. Rewrite the application's API endpoints to retrieve the historical records directly from Postgres using optimized queries instead of local in-memory dictionaries.
4. Secure the Next.js frontend interface dashboard framework by adding a mock JWT token middleware route guard verification step or checking for an auth token cookie header. If an unauthenticated session user tries to view the dashboard routes, display an explicit, styled Access Denied state prompting for secure enterprise credentials.

```

#### Prompt 3.2: Recharts Time-Series Charts & Enterprise Visuals

```text
Replace simple text readouts in the dashboard with production-grade interactive analytics charts using the Recharts library.

1. When an operator selects an individual sector, display a responsive, dual-axis line chart tracking the past 15 data entries.
   - Left Y-Axis: Shows PRB Utilization percentage (Rendered as a smooth Area fill layer using a semi-transparent Amber color).
   - Right Y-Axis: Shows Downlink Throughput in Mbps (Rendered as a sharp, solid blue Line overlay track).
2. Ensure the chart dynamically updates along with the 3-second backend data refresh polling cycles, sliding seamlessly along the horizontal X-axis timestamp labels.
3. Build a global theme context state toggle provider ("Light Mode" and "Dark Mode") inside the root application shell using Tailwind classes (`dark:` modifier). 
4. The dark mode color palette should use an enterprise-ready slate theme: background matching `bg-slate-950`, container blocks matching `bg-slate-900`, and border guidelines matching `border-slate-800` to prevent screen glare fatigue during long overnight engineering monitoring shifts.

```