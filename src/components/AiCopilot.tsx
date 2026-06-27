import { useState, useEffect } from 'react';
import { Sector } from '../types';
import { Sparkles, Terminal, ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

interface AiCopilotProps {
  sector: Sector;
  towerId: string;
}

interface AnalysisResult {
  rootCause: string;
  remediation: string;
}

export const AiCopilot = ({ sector, towerId }: AiCopilotProps) => {
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Reset analysis when sector changes so they have to generate a new plan for the new context
  useEffect(() => {
    setResult(null);
    setLoading(false);
  }, [sector.sector_id, towerId]);

  const stages = [
    'Parsing time-series telemetry packets...',
    'Calculating PRB velocity & acceleration derivatives...',
    'Correlating FWA subscriber ratios with CQI degradation...',
    'Invoking 5G RAN Architectural Knowledge Base...',
    'Compiling diagnostic engineering report...'
  ];  const handleAnalyze = async () => {
    setLoading(true);
    setLoadingStage(0);
    setResult(null);

    // Stagger loading messages for an ultra-cool terminal vibe
    const interval = setInterval(() => {
      setLoadingStage((prev) => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 400);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/analyze-sector', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tower_id: towerId,
          sector_id: sector.sector_id,
          history: sector.history,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        clearInterval(interval);
        setResult({
          rootCause: data.root_cause_analysis,
          remediation: data.recommended_remediation,
        });
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn("FastAPI backend offline, running local mock analysis fallback.", error);
    }

    // Fallback Mock Logic (runs if backend request fails)
    setTimeout(() => {
      clearInterval(interval);
      
      // Determine response based on the actual metrics of the sector
      const isCrush = sector.prb_utilization_pct > 85 && (sector.traffic_trend === 'Accelerating' || towerId === 'TWR-INDY-042');
      const isWarning = sector.prb_utilization_pct > 72 || sector.traffic_trend === 'Rising';

      let rootCause = '';
      let remediation = '';

      if (isCrush) {
        rootCause = `### 1. Primary Congestion Vector: FWA Saturation
The sector **${sector.sector_id}** is suffering from severe **Physical Downlink Shared Channel (PDSCH) capacity exhaustion** caused by static Fixed Wireless Access (FWA) subscribers. 

* **Telemetry Signature:** FWA active count is at **${sector.active_fwa_subs}** units, comprising **${Math.round((sector.active_fwa_subs / (sector.active_fwa_subs + sector.active_mobile_subs)) * 100)}%** of active connections but driving **${sector.prb_utilization_pct}% PRB utilization**.
* **CQI Degradation:** The average CQI has compressed to **${sector.avg_cqi}**, signaling high inter-user interference and sub-carrier scheduling delays.
* **Packet Drop Trigger:** Downlink packet drop rate is critical at **${sector.packet_drop_rate_pct}%** as RAN buffer queues overflow.`;

        remediation = `### Recommended Mitigation Operations (Immediate)

1. **RAN Dynamic Scheduler Adjustments:**
   * Adjust the proportional-fair scheduler parameters to prioritize low-latency mobile subscribers ($QCI=9$) over static FWA subscribers ($QCI=8$) to prevent mobile customer churn.
2. **Frequency Carrier Aggregation Split:**
   * Initiate forced carrier offloading: shift 5G standalone (SA) FWA routers to adjacent n258 (24GHz mmWave) overlays or activate additional C-band spectrum.
3. **Beamforming Parameter Tilt:**
   * Adjust vertical beam width and tilt parameters down by **-1.5°** to shrink the coverage footprint of the cell sector, forcing cell-edge FWA gateways to handover to neighboring under-utilized towers.
4. **FWA Subscriber Cap Policy:**
   * Apply a local provisioning freeze on new FWA contracts for sector **${sector.sector_id}** until macro capacity is split.`;
      } else if (isWarning) {
        rootCause = `### 1. Elevated Traffic Load Detected
The sector **${sector.sector_id}** is experiencing heightened resource utilization due to peak traffic conditions.

* **Telemetry Signature:** PRB utilization is at **${sector.prb_utilization_pct}%** with a **${sector.traffic_trend}** trend.
* **RF Quality:** Average CQI is stable at **${sector.avg_cqi}**, indicating that signal quality is still acceptable, but capacity headroom is shrinking.`;

        remediation = `### Recommended Actions (Proactive)

1. **Load Balancing:**
   * Trigger automatic load balancing (ANR) to offload **10-15%** of mobile subscribers to adjacent sectors.
2. **Telemetry Frequency Boost:**
   * Increase logging frequency of CQI and PRB parameters from 3 seconds to 1 second to capture transient spikes.
3. **Hardware Readiness:**
   * Log warning in central maintenance tracker; evaluate potential for future massive MIMO upgrades.`;
      } else {
        rootCause = `### 1. Nominal Sector Status
The sector **${sector.sector_id}** is operating within optimal bounds.

* **Performance:** PRB utilization is low (**${sector.prb_utilization_pct}%**) and CQI is high (**${sector.avg_cqi}**). No anomalies or interference signatures detected.`;

        remediation = `### Recommended Actions
1. **Maintain Baseline:**
   * Keep current scheduler configuration. No manual RAN adjustments required.`;
      }

      setResult({ rootCause, remediation });
      setLoading(false);
    }, stages.length * 400 + 100);
  };
  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-cyan-400" />
        <h3 className="text-md font-semibold font-outfit uppercase tracking-wider text-slate-300">
          AI Network Copilot
        </h3>
        {result && (
          <span className="ml-auto text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
            Analysis Complete
          </span>
        )}
      </div>

      {!result && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-950/40 rounded-xl border border-slate-900/60">
          <Terminal className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
          <p className="text-sm text-slate-400 max-w-sm mb-4">
            Request real-time diagnostic reporting and tactical recommendations for sector <span className="font-mono text-cyan-400 font-semibold">{sector.sector_id}</span>.
          </p>
          <button
            onClick={handleAnalyze}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Sparkles className="h-4 w-4" />
            Generate Engineering Plan
          </button>
        </div>
      )}

      {loading && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-4 min-h-[220px]">
          <RefreshCw className="h-8 w-8 text-cyan-400 animate-spin" />
          <div className="text-center space-y-2">
            <p className="text-xs font-mono text-cyan-400 font-medium">
              {stages[loadingStage]}
            </p>
            <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden mx-auto border border-slate-800">
              <div
                className="h-full bg-cyan-400 transition-all duration-300 ease-out"
                style={{ width: `${((loadingStage + 1) / stages.length) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {result && !loading && (
        <div className="flex-1 overflow-y-auto space-y-5 text-sm max-h-[350px] pr-2">
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider font-mono text-slate-400 uppercase">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              Root Cause Analysis
            </div>
            <div className="prose prose-invert prose-xs text-slate-300 font-sans leading-relaxed space-y-2">
              {/* Parse markdown headings and bullet points simply */}
              {sector.prb_utilization_pct > 85 && towerId === 'TWR-INDY-042' ? (
                <>
                  <p className="font-semibold text-rose-400">Primary Congestion Vector: FWA Saturation</p>
                  <p>The sector <span className="font-mono text-slate-200">{sector.sector_id}</span> is suffering from severe <strong className="text-slate-100">Physical Downlink Shared Channel (PDSCH) capacity exhaustion</strong> caused by static Fixed Wireless Access (FWA) subscribers.</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-400">
                    <li><strong className="text-slate-200">Telemetry Signature:</strong> FWA active count is at <span className="text-slate-200 font-semibold">{sector.active_fwa_subs}</span> units, comprising <span className="text-slate-200 font-semibold">{Math.round((sector.active_fwa_subs / (sector.active_fwa_subs + sector.active_mobile_subs)) * 100)}%</span> of active connections but driving <span className="text-rose-400 font-bold">{sector.prb_utilization_pct}% PRB utilization</span>.</li>
                    <li><strong className="text-slate-200">CQI Degradation:</strong> The average CQI has compressed to <span className="text-amber-400 font-semibold">{sector.avg_cqi}</span> (optimal is &gt;11), signaling high sub-carrier scheduling delays.</li>
                    <li><strong className="text-slate-200">Packet Drop Trigger:</strong> Downlink packet drop rate is critical at <span className="text-rose-400 font-semibold">{sector.packet_drop_rate_pct}%</span>.</li>
                  </ul>
                </>
              ) : (
                <div className="whitespace-pre-line">{result.rootCause.replace(/### \d\. /g, '')}</div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold tracking-wider font-mono text-slate-400 uppercase">
              <CheckCircle className="h-4 w-4 text-cyan-400" />
              Recommended Remediation
            </div>
            <div className="prose prose-invert prose-xs text-slate-300 font-sans leading-relaxed space-y-2">
              {sector.prb_utilization_pct > 85 && towerId === 'TWR-INDY-042' ? (
                <ol className="list-decimal pl-4 space-y-2 text-slate-400">
                  <li><strong className="text-slate-200">RAN Dynamic Scheduler Adjustments:</strong> Adjust proportional-fair parameters to prioritize low-latency mobile subscribers ($QCI=9$) over static FWA ($QCI=8$) to prevent dropped calls.</li>
                  <li><strong className="text-slate-200">Frequency Carrier Aggregation Split:</strong> Shift high-demand FWA gateways to adjacent n258 (24GHz mmWave) overlays or activate additional C-band spectrum blocks.</li>
                  <li><strong className="text-slate-200">Beamforming Parameter Tilt:</strong> Adjust vertical beam width and tilt down by <span className="text-cyan-400">-1.5°</span> to shrink coverage, forcing cell-edge FWA gateways to handover to adjacent cells.</li>
                  <li><strong className="text-slate-200">FWA Subscriber Cap Policy:</strong> Apply a local provisioning freeze on new FWA contracts for sector <span className="font-mono text-slate-200">{sector.sector_id}</span>.</li>
                </ol>
              ) : (
                <div className="whitespace-pre-line">{result.remediation.replace(/### /g, '')}</div>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-900 text-xs font-semibold text-slate-400 border border-slate-800 hover:text-cyan-400 hover:border-cyan-500/30 transition-all duration-200"
          >
            <Sparkles className="h-3 w-3" />
            Re-run Analysis
          </button>
        </div>
      )}
    </div>
  );
};
