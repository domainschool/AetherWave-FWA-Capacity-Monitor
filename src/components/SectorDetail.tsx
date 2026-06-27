import { Tower, Sector } from '../types';
import { SectorCard } from './SectorCard';
import { TelemetryChart } from './TelemetryChart';
import { AiCopilot } from './AiCopilot';
import { Server, Radio, BarChart3, Activity } from 'lucide-react';

interface SectorDetailProps {
  selectedTower: Tower | null;
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
}

export const SectorDetail = ({
  selectedTower,
  selectedSectorId,
  onSelectSector,
}: SectorDetailProps) => {
  if (!selectedTower) {
    return (
      <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center h-full border border-slate-800 min-h-[500px]">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(255,255,255,0.02)]">
          <Radio className="h-6 w-6 text-slate-500 animate-pulse-slow" />
        </div>
        <h3 className="text-xl font-semibold font-outfit text-slate-300 mb-2">
          No RAN Node Selected
        </h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Select a 5G macro cell tower from the sidebar to inspect sector-level real-time performance and predict capacity thresholds.
        </p>
      </div>
    );
  }

  // Find the selected sector object
  const selectedSector: Sector | null = selectedTower.sectors.find(
    (s) => s.sector_id === selectedSectorId
  ) || null;

  // Health Styling
  let healthColor = 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
  if (selectedTower.health_status === 'Warning') {
    healthColor = 'text-amber-400 border-amber-500/20 bg-amber-500/5';
  } else if (selectedTower.health_status === 'Critical') {
    healthColor = 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  }

  return (
    <div className="space-y-6">
      {/* Tower Node Header */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-mono text-slate-100">{selectedTower.tower_id}</h2>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono font-medium ${healthColor}`}>
                {selectedTower.health_status} Status
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">{selectedTower.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-400 sm:border-l sm:border-slate-800 sm:pl-4">
          <div className="text-right hidden sm:block">
            <span className="block text-[10px] uppercase text-slate-500 tracking-wider">Operational Bandwidth</span>
            <span className="text-slate-300 font-semibold">C-Band / mmWave Aggregate</span>
          </div>
        </div>
      </div>

      {/* Sector Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {selectedTower.sectors.map((sector) => (
          <SectorCard
            key={sector.sector_id}
            sector={sector}
            isSelected={selectedSectorId === sector.sector_id}
            onSelect={() => onSelectSector(sector.sector_id)}
          />
        ))}
      </div>

      {/* Detail Analysis Area */}
      {selectedSector ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart Panel */}
          <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-900/60">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-semibold font-outfit uppercase tracking-wider text-slate-300">
                  Telemetry Waveform Visualizer
                </h3>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                  Sector: {selectedSector.sector_id} • 3s Polling Intervals
                </p>
              </div>
            </div>
            
            <TelemetryChart history={selectedSector.history} />
          </div>

          {/* AI Advisor Panel */}
          <div className="lg:col-span-5">
            <AiCopilot sector={selectedSector} towerId={selectedTower.tower_id} />
          </div>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl p-8 flex flex-col items-center justify-center text-center border border-slate-800 min-h-[300px]">
          <Activity className="h-8 w-8 text-slate-600 mb-3 animate-pulse" />
          <h4 className="text-md font-semibold text-slate-400 mb-1">
            Sector Telemetry Waveform Standby
          </h4>
          <p className="text-xs text-slate-500 max-w-xs">
            Select a specific sector (SEC-1, SEC-2, SEC-3) from the cards above to plot historical performance and generate AI root-cause diagnostics.
          </p>
        </div>
      )}
    </div>
  );
};
