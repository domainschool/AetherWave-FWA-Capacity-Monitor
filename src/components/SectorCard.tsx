import { Sector } from '../types';
import { Network, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface SectorCardProps {
  sector: Sector;
  isSelected: boolean;
  onSelect: () => void;
}

export const SectorCard = ({
  sector,
  isSelected,
  onSelect
}: SectorCardProps) => {
  const isCrushRisk = sector.prb_utilization_pct >= 85.0 && sector.traffic_trend === 'Accelerating';

  // PRB color coding
  let prbTextColor = 'text-cyan-400';
  let prbBarColor = 'bg-cyan-400';
  if (sector.prb_utilization_pct > 85) {
    prbTextColor = 'text-rose-400';
    prbBarColor = 'bg-rose-500';
  } else if (sector.prb_utilization_pct > 70) {
    prbTextColor = 'text-amber-400';
    prbBarColor = 'bg-amber-500';
  }

  // Trend Badge color coding
  let trendBg = 'bg-slate-800/80 text-slate-400 border-slate-700/50';
  if (sector.traffic_trend === 'Rising') {
    trendBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
  } else if (sector.traffic_trend === 'Accelerating') {
    trendBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
  }

  return (
    <div
      onClick={onSelect}
      className={`relative glass-panel cursor-pointer rounded-2xl p-5 border transition-all duration-300 select-none overflow-hidden ${
        isCrushRisk
          ? 'border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.15)] glow-red animate-blink'
          : isSelected
          ? 'border-cyan-500/60 shadow-[0_0_12px_rgba(6,182,212,0.15)] bg-slate-900/40'
          : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
      }`}
    >
      {/* Background decoration for crush risk */}
      {isCrushRisk && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full filter blur-xl pointer-events-none" />
      )}

      {/* Header Info */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-950/60 text-slate-400'}`}>
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-mono text-sm font-semibold text-slate-200">{sector.sector_id}</h4>
            <p className="text-[10px] text-slate-400 font-sans tracking-wide max-w-[130px] truncate">
              {sector.frequency_band}
            </p>
          </div>
        </div>

        <span className={`text-[10px] px-2 py-0.5 rounded border font-mono tracking-wider font-semibold flex items-center gap-1 ${trendBg}`}>
          <TrendingUp className="h-3 w-3" />
          {sector.traffic_trend}
        </span>
      </div>

      {/* PRB Gauge */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 font-sans text-[11px]">PRB Utilization</span>
          <span className={`${prbTextColor} font-bold`}>{sector.prb_utilization_pct}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
          <div
            className={`h-full ${prbBarColor} transition-all duration-500 ease-out`}
            style={{ width: `${sector.prb_utilization_pct}%` }}
          />
        </div>
      </div>

      {/* Sector Performance Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900/60">
        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Throughput</span>
          <span className="text-xs font-mono font-bold text-slate-200 flex items-baseline gap-0.5">
            {sector.throughput_mbps} <span className="text-[9px] text-slate-500 font-medium">Mbps</span>
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Avg CQI</span>
          <span className="text-xs font-mono font-bold text-slate-200">
            {sector.avg_cqi} <span className="text-[9px] text-slate-500 font-medium">/ 15</span>
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">Packet Drop</span>
          <span className="text-xs font-mono font-bold text-slate-200">
            {sector.packet_drop_rate_pct}%
          </span>
        </div>

        <div className="space-y-0.5">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block">FWA Subs</span>
          <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1">
            <Users className="h-3 w-3 text-cyan-400/80" />
            {sector.active_fwa_subs}
          </span>
        </div>
      </div>

      {/* Blinking Danger Alert */}
      {isCrushRisk && (
        <div className="mt-4 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-mono text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase justify-center shadow-lg">
          <AlertTriangle className="h-3.5 w-3.5 animate-pulse text-rose-400" />
          Crush Risk Detected
        </div>
      )}
    </div>
  );
};
