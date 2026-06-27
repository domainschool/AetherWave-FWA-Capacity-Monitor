import { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  BookOpen, 
  Users, 
  DollarSign, 
  Briefcase, 
  Terminal, 
  Sparkles, 
  Copy, 
  Check, 
  TrendingUp,
  Workflow
} from 'lucide-react';

interface LearningDeckProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LearningDeck = ({ isOpen, onClose }: LearningDeckProps) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  if (!isOpen) return null;

  const tabs = [
    { id: 0, label: '1. Problem & Core Concept', icon: BookOpen },
    { id: 1, label: '2. Required Domain Knowledge', icon: TrendingUp },
    { id: 2, label: '3. Data Flow & Architecture', icon: Workflow },
    { id: 3, label: '4. Stakeholders & Personas', icon: Users },
    { id: 4, label: '5. Commercial Valuations', icon: DollarSign },
    { id: 5, label: '6. College & Resume Strategy', icon: Briefcase },
    { id: 6, label: '7. AI Vibe-Coding Prompts', icon: Terminal },
    { id: 7, label: '8. Further Enhancements', icon: Sparkles }
  ];

  const prompts = [
    {
      id: '1.1',
      title: 'Prompt 1.1: Component Shell & Initial Layout Setup',
      text: `Create a single-page React component using Tailwind CSS and Lucide React icons for a Next.js App Router setup. This dashboard is a "5G FWA Capacity Crush Monitor" for telecom network engineers. 

Build a clean layout containing:
1. A top header bar with the product title "AetherWave: FWA Capacity Monitor", a simulated live clock displaying current UTC time, and a status badge stating "System Status: Local Emulation Active".
2. A two-column main layout:
   - Left Column (Width: 1/3): A sidebar containing a list of 5 simulated cell towers (e.g., TWR-INDY-001 through TWR-INDY-005). Each tower should display its ID, total active subscribers, and a dynamic color-coded health badge (Healthy, Warning, Critical).
   - Right Column (Width: 2/3): A detailed view pane that updates based on the selected tower. If no tower is selected, display an empty slate state instructing the user to "Select a cell tower from the sidebar to view sector-level real-time telemetry."

Keep all state local for now using React's useState. Use clean, professional typography suitable for an enterprise B2B infrastructure tool.`
    },
    {
      id: '1.2',
      title: 'Prompt 1.2: Mock Data & Sector Detail Panel',
      text: `Enhance the dashboard component by defining a hardcoded local array of mock data containing 3 sectors for each of the 5 cell towers. 

Each sector object must include the following properties:
- sector_id (e.g., SEC-1, SEC-2, SEC-3)
- frequency_band (e.g., "n78 3.5GHz C-Band" or "n258 24GHz mmWave")
- active_fwa_subs (integer)
- active_mobile_subs (integer)
- prb_utilization_pct (float between 30.0 and 98.0)
- avg_cqi (float between 6.0 and 14.5)
- throughput_mbps (float between 50.0 and 850.0)
- traffic_trend ("Stable", "Rising", "Accelerating")

When a user clicks a tower in the left sidebar, render a grid layout of these 3 sectors in the right column main pane. Each sector should be rendered as a card component showing these key network indicators clearly with small descriptive sub-labels (e.g., "PRB Utilization", "Avg CQI"). If a sector has a traffic_trend of "Accelerating" and a prb_utilization_pct over 85%, render an amber or red blinking pulse animation badge labeled "CRUSH RISK DETECTED".`
    },
    {
      id: '1.3',
      title: 'Prompt 1.3: Real-Time State Emulation Clock',
      text: `Implement an internal JavaScript interval timer within the component to simulate a live network stream using local state changes. 

Every 3 seconds, loop through the active tower and sector states and mutate the values slightly to show active network activity:
- Fluctuate the \`prb_utilization_pct\` by adding or subtracting a random float between -1.5% and +1.5%. Ensure the value clamps between 0% and 100%.
- Adjust \`throughput_mbps\` relative to the PRB change (if PRB goes up, throughput drops slightly).
- Explicitly program "TWR-INDY-042" / "SEC-3" to steadily escalate its \`prb_utilization_pct\` by +4.0% every interval cycle to simulate a deterministic FWA capacity crunch during evening prime-time.

Add a manual "Reset Simulation" button in the top header that reverts all data back to its original baseline state so that users can view the data cycle transition repeatedly during testing without needing a browser page refresh.`
    },
    {
      id: '2.1',
      title: 'Prompt 2.1: FastAPI Telemetry & Stream Architecture Setup',
      text: `We are separating the frontend UI from the data engine. Create a Python backend script using FastAPI (\`main.py\`).

1. Define a Pydantic schema for incoming raw tower logs containing fields: \`timestamp\`, \`tower_id\`, \`sector_id\`, \`frequency_band\`, \`fwa_subscribers_active\`, \`mobile_subscribers_active\`, \`prb_utilization_pct\`, \`avg_cqi\`, and \`downlink_throughput_mbps\`.
2. Create an in-memory storage dictionary that keeps track of the last 15 historical telemetry entries for each tower/sector combination.
3. Build a \`/api/telemetry\` GET endpoint that returns the complete current status of all towers and sectors.
4. Implement an internal background routing loop calculation that assesses the first derivative (Velocity) and second derivative (Acceleration) of \`prb_utilization_pct\` over the stored historical records. If the acceleration metric is highly positive, append a new computed field to that sector's API payload: \`"acceleration_alert_level": "CRITICAL"\`.

Modify the existing Next.js frontend dashboard to fetch data from this FastAPI \`/api/telemetry\` endpoint every 3 seconds using standard asynchronous fetch inside a \`useEffect\` hook. Add skeleton loading states (shimmer effects) that render inside the component UI while waiting for the first initial network payload response.`
    },
    {
      id: '2.2',
      title: 'Prompt 2.2: Generative AI Root Cause & Remediation Generator',
      text: `Integrate AI analysis capabilities into the solution. Add a dedicated "AI Engineer Assistant" text card panel to the bottom section of the right-hand Sector Detail view pane.

1. Create a new POST endpoint in the FastAPI backend called \`/api/analyze-sector\`. This endpoint accepts a historical array of the last 10 telemetry points for a single congested sector.
2. Inside this endpoint, construct a prompt for an LLM (such as Gemini or OpenAI GPT-4o) using secure environment variables (\`.env\`).
3. The prompt must instruct the LLM to act as an expert 5G Radio Access Network (RAN) architect. It should read the telemetry patterns (such as dropping CQI under rising FWA subscriber count) and return a strict JSON payload with two distinct markdown keys: \`"root_cause_analysis"\` and \`"recommended_remediation"\` (e.g., recommending a sector carrier power adjust, beamforming split, or FWA subscriber capping policy).
4. Add an interactive "Generate Engineering Plan" action button inside the frontend dashboard's Sector card interface. Clicking this triggers the API call, puts the specific panel into a spinning loading state, and displays the response markdown text inside the component layout when returned.`
    },
    {
      id: '3.1',
      title: 'Prompt 3.1: Supabase Database Integration & Auth Guards',
      text: `Scale the prototype to enterprise production grade by replacing in-memory storage with a persistent database tier using Supabase (PostgreSQL).

1. Provide the SQL schema script needed to create a \`telemetry_logs\` table with an automatic index applied on the \`(tower_id, sector_id, timestamp DESC)\` columns to optimize performance under massive telemetry loads.
2. Update the Python FastAPI application backend to append all incoming telemetry items securely into the Supabase client connection instance.
3. Rewrite the application's API endpoints to retrieve the historical records directly from Postgres using optimized queries instead of local in-memory dictionaries.
4. Secure the Next.js frontend interface dashboard framework by adding a mock JWT token middleware route guard verification step or checking for an auth token cookie header. If an unauthenticated session user tries to view the dashboard routes, display an explicit, styled Access Denied state prompting for secure enterprise credentials.`
    },
    {
      id: '3.2',
      title: 'Prompt 3.2: Recharts Time-Series Charts & Enterprise Visuals',
      text: `Replace simple text readouts in the dashboard with production-grade interactive analytics charts using the Recharts library.

1. When an operator selects an individual sector, display a responsive, dual-axis line chart tracking the past 15 data entries.
   - Left Y-Axis: Shows PRB Utilization percentage (Rendered as a smooth Area fill layer using a semi-transparent Amber color).
   - Right Y-Axis: Shows Downlink Throughput in Mbps (Rendered as a sharp, solid blue Line overlay track).
2. Ensure the chart dynamically updates along with the 3-second backend data refresh polling cycles, sliding seamlessly along the horizontal X-axis timestamp labels.
3. Build a global theme context state toggle provider ("Light Mode" and "Dark Mode") inside the root application shell using Tailwind classes (\`dark:\` modifier). 
4. The dark mode color palette should use an enterprise-ready slate theme: background matching \`bg-slate-950\`, container blocks matching \`bg-slate-900\`, and border guidelines matching \`border-slate-800\` to prevent screen glare fatigue during long overnight engineering monitoring shifts.`
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-6 overflow-hidden">
      <div className="glass-panel w-full max-w-6xl h-[85vh] rounded-3xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative animate-flow-glow">
        
        {/* Header Panel */}
        <div className="px-6 py-5 border-b border-slate-900 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <HelpCircle className="h-5 w-5 text-cyan-400" />
            <h2 className="text-md sm:text-lg font-bold font-outfit uppercase tracking-wider text-slate-100">
              AetherWave: Learning Deck & System Architecture
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-slate-400 hover:text-slate-100 hover:border-slate-700 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Navigation Sidebar (Left) */}
          <nav className="w-full md:w-[280px] bg-slate-950/50 md:border-r border-slate-900 p-4 space-y-1.5 overflow-y-auto flex flex-row md:flex-col gap-2 md:gap-0 select-none pb-3 md:pb-4 border-b md:border-b-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide border transition-all duration-200 shrink-0 whitespace-nowrap md:whitespace-normal ${
                    isActive
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)]'
                      : 'bg-slate-950/10 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>

          {/* Details Panel (Right) */}
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-slate-950/20 font-sans space-y-6">
            
            {activeTab === 0 && (
              <div className="space-y-5 animate-pulse-slow">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <BookOpen className="h-5 w-5 text-cyan-400" />
                  The Business Problem: Preventing the 5G Capacity Crush
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  The transition of 5G from a mobile-only network to a primary home broadband solution via <strong>Fixed Wireless Access (FWA)</strong> has introduced an asymmetric traffic crisis for telecom operators worldwide.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Mobile Handset Account</span>
                    <span className="text-lg font-bold text-slate-200 font-mono">15 - 20 GB / mo</span>
                    <p className="text-xs text-slate-400 mt-1">Bursty traffic patterns, transient usage, low spectrum footprints.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 border-cyan-500/20">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-500 block">FWA Router Account</span>
                    <span className="text-lg font-bold text-cyan-400 font-mono">500 - 1,000+ GB / mo</span>
                    <p className="text-xs text-slate-400 mt-1">Continuous 4K/8K media streaming, heavy downloads, static location.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Severe Commercial Impact of Congestion</h4>
                  <ul className="list-disc pl-5 text-xs text-slate-300 space-y-1">
                    <li><strong className="text-slate-100">Customer Churn:</strong> Mobile users experience dropped packets and stalled downloads, triggering defection.</li>
                    <li><strong className="text-slate-100">SLA Contract Breaches:</strong> Enterprise customers utilizing cellular backup suffer packet losses, invoking financial penalties.</li>
                    <li><strong className="text-slate-100">Reactive CapEx Bleed:</strong> Network engineering budgets are depleted trying to splits sectors or add hardware reactively.</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 1 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <TrendingUp className="h-5 w-5 text-cyan-400" />
                  Required Domain Knowledge & KPIs
                </h3>
                <p className="text-sm text-slate-300">
                  To operate and build capacity monitors, network engineers track specific Key Performance Indicators (KPIs) emitting from 3GPP cellular networks:
                </p>
                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">PRB (Physical Resource Block) Utilization</strong>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      The percentage of the total radio spectrum block currently assigned to active users. Consistent PRB utilization above **85%** indicates a saturated radio channel.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">CQI (Channel Quality Indicator)</strong>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      A scale from **1 to 15** reported back by devices indicating signal quality. A dropping average CQI under high subscriber loads points to inter-user scheduler interference and sector edge degradation.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-1">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">Throughput (Mbps) & Drop Rate %</strong>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Throughput measures effective bandwidth. Drop rate represents buffer overflows. As resource utilization hits 100%, queues stack up and drop rates rise.
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">The Calculus of Predictive Alerting</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Standard monitors alert *after* PRB hits 90% (when the network is already crashing). This app tracks the **first derivative (Velocity)** and **second derivative (Acceleration)** of PRB:
                  </p>
                  <div className="p-3 bg-slate-950/80 rounded border border-slate-900 font-mono text-xs text-center space-y-2">
                    <div className="text-cyan-400 font-semibold">Velocity = dP / dt &nbsp;&nbsp;|&nbsp;&nbsp; Acceleration = dV / dt</div>
                    <div className="text-[10px] text-slate-500">Positive acceleration flags compounding demand, predicting congestion 30 minutes in advance.</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 2 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Workflow className="h-5 w-5 text-cyan-400" />
                  Systems Architecture & Data Flow
                </h3>
                <p className="text-sm text-slate-300">
                  AetherWave is structured as a decoupled full-stack telemetry platform utilizing an event-driven ingestion flow:
                </p>
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 font-mono text-xs text-cyan-400 overflow-x-auto leading-relaxed shadow-inner">
                  <pre>{`[ Mock Data Generator Script (Python) ]
               │
               ▼ (Continuous HTTP POST Telemetry Payloads)
 [ FastAPI / Python Ingestion Engine ] 
               │
      ┌────────┴────────┐
      ▼ (Rolling Cache) ▼ (LLM prompt context assembly)
[Derivative Calc]  [Gemini 1.5 Flash API]
  (Velocity/Acc)       │
      │                ▼ (Root Cause & Remediation JSON)
      └────────┬───────┘
               ▼ (State Synchronization)
[ React / Tailwind NOC Dashboard UI (Vite) ]`}</pre>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-sans">
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
                    <h4 className="font-bold text-slate-200 mb-1">1. Telemetry Ingestion</h4>
                    <p className="text-slate-400">The script formats logs according to a 3GPP-aligned Pydantic schema and sends updates to FastAPI every 3s.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
                    <h4 className="font-bold text-slate-200 mb-1">2. Analytical Worker</h4>
                    <p className="text-slate-400">FastAPI parses incoming logs, appends them to a rolling queue, and runs derivative analysis on the history.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800/80">
                    <h4 className="font-bold text-slate-200 mb-1">3. AI Insights Console</h4>
                    <p className="text-slate-400">Generates precise, domain-aligned mitigation instructions via Gemini by submitting structural histories.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 3 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Users className="h-5 w-5 text-cyan-400" />
                  Stakeholders & Operations Personas
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4 p-4 rounded-xl bg-slate-900/20 border border-slate-900">
                    <div className="p-2 bg-cyan-950/40 text-cyan-400 rounded-lg h-fit border border-cyan-500/10">
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">1. RAN Capacity & Operations Engineers</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Use the real-time visual grid and alert blinkers to monitor node loading. When a sector experiences positive acceleration, they execute proactive beam-tilts or traffic balancing.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-slate-900/20 border border-slate-900">
                    <div className="p-2 bg-purple-950/40 text-purple-400 rounded-lg h-fit border border-purple-500/10">
                      <Workflow className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">2. Network Infrastructure Strategy Planners</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Analyze historical trend charts mapping PRB vs Throughput. They use this data to identify persistent hotspots and justify splits, upgrades, or new fiber builds.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4 p-4 rounded-xl bg-slate-900/20 border border-slate-900">
                    <div className="p-2 bg-amber-950/40 text-amber-400 rounded-lg h-fit border border-amber-500/10">
                      <HelpCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">3. Customer SLA Assurance Managers</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Review packet drop logs during alert conditions to audit contractual agreements with enterprise clients and predict potential penalty liabilities before they occur.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <DollarSign className="h-5 w-5 text-cyan-400" />
                  Commercial Valuation & Disruption Strategy
                </h3>

                {/* Executive Summary Card */}
                <div className="p-5 rounded-2xl bg-slate-900/30 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">Executive Summary</span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    The <strong>AetherWave</strong> project, an enterprise-grade telemetry and predictive monitoring platform, is estimated to cost over <strong>$550,000</strong> and take <strong>6 months</strong> with traditional consulting delivery. In stark contrast, a highly functional MVP leveraging modern development practices like vibe-coding, serverless architecture, and AI assistance could be deployed in just <strong>5 weeks</strong> for under <strong>$500</strong>, demonstrating a monumental cost efficiency gain.
                  </p>
                </div>

                {/* Value Disrupted Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/5 to-cyan-500/5 border border-amber-500/20 text-center space-y-2 relative overflow-hidden">
                  <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 via-transparent to-transparent pointer-events-none" />
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 inline-block">
                    Value Disrupted
                  </span>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
                    By leveraging deep Domain Knowledge in the <strong className="text-slate-200">Telecommunications</strong> sector, you are disrupting a corporate value of:
                  </p>
                  <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                    $558,750
                  </div>
                </div>

                {/* Side-by-Side Cost Comparison Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Agency Card */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-red-500/10 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">IT Consulting Agency Cost</h4>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">Premium Delivery Agency</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Sourced using standard rates from Deloitte, TCS, Accenture, IBM, and Infosys. Assumes corporate middleware overheads, QA cycles, and service level support agreements.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Total Budget</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">$559,200</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Effort Hours</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">5,136h</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Delivery Time</span>
                        <span className="text-sm font-bold text-slate-200 font-mono">24 wks</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2">
                      <span>Blended Hourly Billing Rate:</span>
                      <span className="text-slate-300 font-bold">$109/hr</span>
                    </div>
                  </div>

                  {/* Vibe-Coded Card */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/15 space-y-4 shadow-[0_0_15px_rgba(6,182,212,0.03)]">
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                      <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">Vibe-Coded MVP Cost</h4>
                      <span className="text-[9px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">Domain School MVP</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Assumes code built using AI-driven orchestration, modern serverless templates (Vercel/Supabase), and high-intensity agile build loops.
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Infrastructure</span>
                        <span className="text-sm font-bold text-cyan-400 font-mono">$450</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Capital Saved</span>
                        <span className="text-sm font-bold text-cyan-400 font-mono">$558,750</span>
                      </div>
                      <div className="p-2.5 bg-slate-900/40 rounded-xl border border-slate-800/40">
                        <span className="text-[8px] font-mono text-slate-500 uppercase block">Build Phase</span>
                        <span className="text-sm font-bold text-cyan-400 font-mono">5 wks</span>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 border-t border-slate-900 pt-2 leading-relaxed font-sans">
                      This AetherWave project, traditionally costing over half a million dollars and taking six months with conventional consulting, can be rapidly deployed as a highly functional MVP in just 5 weeks for less than $500. By leveraging vibe-coding for the frontend, serverless platforms like Vercel and Supabase, and AI code generation, the Domain School approach bypasses corporate bureaucracy and excessive overhead. This model dramatically slashes costs by over 99%, delivering significant value with minimal initial investment.
                    </div>
                  </div>

                </div>

                {/* Itemized Resource Allocation Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Itemized Resource Allocation</h4>
                    <span className="text-[9px] text-slate-500 font-mono">Rates model average Tier 1 agency billing</span>
                  </div>
                  <div className="overflow-hidden border border-slate-900 rounded-xl bg-slate-950/50">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className="bg-slate-900 text-slate-400 uppercase text-[9px] tracking-wider border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-2.5">Resource / Role</th>
                          <th className="px-4 py-2.5">Rate / Hr</th>
                          <th className="px-4 py-2.5">Allocated Hours</th>
                          <th className="px-4 py-2.5">Subtotal</th>
                          <th className="px-4 py-2.5">Delivery Focus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900 text-slate-300">
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">Delivery Manager/Project Manager</td>
                          <td className="px-4 py-2.5">$120/hr</td>
                          <td className="px-4 py-2.5">480h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$57,600</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Oversees project execution, manages client communication, facilitates agile ceremonies, and ensures timely delivery and risk mitigation.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">Lead Solutions Architect</td>
                          <td className="px-4 py-2.5">$150/hr</td>
                          <td className="px-4 py-2.5">576h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$86,400</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Defines the end-to-end technical architecture for AetherWave, selects core technologies, and ensures system scalability, resilience, and security compliance.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">Senior Backend Engineer</td>
                          <td className="px-4 py-2.5">$110/hr</td>
                          <td className="px-4 py-2.5">960h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$105,600</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Develops the high-throughput ingestion layer, implements the time-series analytics engine, integrates with the database, and builds LLM interaction APIs.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">Senior Frontend Engineer</td>
                          <td className="px-4 py-2.5">$110/hr</td>
                          <td className="px-4 py-2.5">960h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$105,600</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Crafts the interactive Next.js web application, integrates WebSockets for real-time data, and implements advanced multi-axis visualizations and enterprise security.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">DevOps & Deployment Engineer</td>
                          <td className="px-4 py-2.5">$100/hr</td>
                          <td className="px-4 py-2.5">720h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$72,000</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Designs, implements, and manages the production-grade cloud infrastructure, automates CI/CD pipelines, and ensures platform observability and operational readiness.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">QA / Testing Engineer</td>
                          <td className="px-4 py-2.5">$90/hr</td>
                          <td className="px-4 py-2.5">960h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$86,400</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Develops and executes comprehensive test strategies, including functional, performance, and security testing, to validate the platform's reliability and quality.</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-2.5 font-sans font-semibold text-slate-200">Business Analyst</td>
                          <td className="px-4 py-2.5">$95/hr</td>
                          <td className="px-4 py-2.5">480h</td>
                          <td className="px-4 py-2.5 font-bold text-amber-500">$45,600</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400">Facilitates requirements gathering from telecommunications carriers, translates business needs into detailed user stories, and ensures alignment with project objectives.</td>
                        </tr>
                        <tr className="bg-amber-500/5 text-amber-400 font-bold border-t border-amber-500/20">
                          <td className="px-4 py-2.5 font-sans uppercase">Project Estimation Total</td>
                          <td className="px-4 py-2.5">-</td>
                          <td className="px-4 py-2.5">5,136h</td>
                          <td className="px-4 py-2.5 font-black text-sm">$559,200</td>
                          <td className="px-4 py-2.5 font-sans text-slate-400 text-[10px]">Value disrupted for a $450 vibe-coded MVP build.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 5 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                  College & Resume Positioning Strategy
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  In today's competitive landscape, simple projects (like Todo apps or clone dashboards) fail to stand out. Admissions officers and technical hiring managers search for **domain-specific depth, mathematical reasoning, and full-stack system boundaries**.
                </p>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Resume Bullet Template 1 (Analytics Focus)</span>
                    <p className="text-xs text-slate-300 font-mono italic">
                      "Architected a real-time full-stack network capacity telemetry platform in Python and React that calculates rolling first and second derivatives of Physical Resource Block (PRB) utilization, successfully warning operators of capacity crush risks 30 minutes in advance."
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-2">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">Resume Bullet Template 2 (AI Focus)</span>
                    <p className="text-xs text-slate-300 font-mono italic">
                      "Integrated Gemini Generative AI diagnostics via structured JSON prompting into a telecommunication NOC interface, providing automatic root-cause and remediation scripts based on historical 3GPP tower log telemetry signatures."
                    </p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-2 text-xs text-slate-400 leading-relaxed">
                  <h4 className="font-bold text-slate-200">How to Differentiate Your Portfolio</h4>
                  <p>
                    Instead of positioning yourself as a "coder who knows Python," explain that you are a **"Solution Engineer who applies time-series analysis and telemetry parsing to solve network resource bottlenecks."** This frames you as someone who bridges the gap between software engineering, physical architecture, and data science.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 6 && (
              <div className="space-y-6">
                <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                  <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2">
                    <Terminal className="h-5 w-5 text-cyan-400" />
                    AI Vibe-Coding Prompt Runway
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Prompts.md Source</span>
                </div>
                <p className="text-sm text-slate-300">
                  Below are the exact progressive prompts used to create the core layers of this application. You can copy these prompt strings to recreate or expand this dashboard in any AI-assisted environment:
                </p>

                <div className="space-y-4 pr-1">
                  {prompts.map((prompt) => (
                    <div key={prompt.id} className="rounded-xl border border-slate-900 overflow-hidden bg-slate-950/60 flex flex-col">
                      <div className="px-4 py-3 bg-slate-900/80 border-b border-slate-950 flex items-center justify-between">
                        <span className="text-xs font-mono font-semibold text-slate-200">{prompt.title}</span>
                        <button
                          onClick={() => handleCopy(prompt.text, prompt.id)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hover:text-cyan-400 transition-all duration-200"
                        >
                          {copiedPromptId === prompt.id ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span>Copy Prompt</span>
                            </>
                          )}
                        </button>
                      </div>
                      <div className="p-4 max-h-[160px] overflow-y-auto font-mono text-slate-400 text-xs bg-slate-950/80 leading-relaxed whitespace-pre-wrap">
                        {prompt.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 7 && (
              <div className="space-y-5">
                <h3 className="text-lg font-bold font-outfit text-slate-100 flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Sparkles className="h-5 w-5 text-cyan-400" />
                  Further Extensions & Enhancements
                </h3>
                <p className="text-sm text-slate-300">
                  Ready to take this application to a production-hardened scale? Here are the next architectural steps to implement:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-1.5">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">1. Persistent DB Tier</strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Replace in-memory data queues with PostgreSQL (via Supabase). Index columns on `(tower_id, sector_id, timestamp DESC)` to retrieve logs efficiently under high ingest pressure.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-1.5">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">2. Geographic GIS Mapping</strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Integrate an interactive map overlay (`Leaflet.js` or `Mapbox`) plotting coordinates of towers and sectors. Dynamically color-code sectors in real-time on the map based on congestion velocity.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-1.5">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">3. Push-based WebSockets</strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Transition from frontend 3-second HTTP polling to live WebSocket client subscriptions to push new metrics instantly to operator views without page refreshes.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900/20 border border-slate-900 space-y-1.5">
                    <strong className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">4. Authentication & RBAC</strong>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Implement JWT-based authorization route guards. Provide Role-Based Access Controls (RBAC) separating NOC monitor operations from field technicians and planning managers.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
        
      </div>
    </div>
  );
};
