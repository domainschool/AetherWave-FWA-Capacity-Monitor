import { Tower, Sector } from '../types';
import { Radio, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface SidebarProps {
  towers: Tower[];
  selectedTowerId: string | null;
  onSelectTower: (towerId: string) => void;
}

export const Sidebar = ({
  towers,
  selectedTowerId,
  onSelectTower,
}: SidebarProps) => {
  return (
    <aside className="glass-panel rounded-2xl p-5 flex flex-col h-full overflow-hidden border border-slate-800">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-800">
        <Activity className="h-5 w-5 text-cyan-400 animate-pulse-slow" />
        <h2 className="text-lg font-semibold tracking-wider font-outfit uppercase text-slate-300">
          RAN Nodes List
        </h2>
        <span className="ml-auto text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
          N={towers.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {towers.map(tower => {
          const isSelected = selectedTowerId === tower.tower_id;
          
          // Calculate total subscribers for display
          const totalFwa = tower.sectors.reduce((sum: number, s: Sector) => sum + s.active_fwa_subs, 0);
          const totalMobile = tower.sectors.reduce((sum: number, s: Sector) => sum + s.active_mobile_subs, 0);
          const totalSubs = totalFwa + totalMobile;

          // Health styling
          let healthIcon = <ShieldCheck className="h-4 w-4 text-emerald-400" />;
          let healthBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

          if (tower.health_status === 'Warning') {
            healthIcon = <AlertTriangle className="h-4 w-4 text-amber-400" />;
            healthBg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
          } else if (tower.health_status === 'Critical') {
            healthIcon = <AlertTriangle className="h-4 w-4 text-rose-400" />;
            healthBg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          }

          return (
            <div
              key={tower.tower_id}
              onClick={() => onSelectTower(tower.tower_id)}
              className={`glass-panel-hover p-4 rounded-xl cursor-pointer border transition-all duration-200 relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900/80 border-cyan-500/50 shadow-[inset_0_0_12px_rgba(6,182,212,0.1)]'
                  : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
              }`}
            >
              {/* Active selection vertical line */}
              {isSelected && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 to-cyan-600 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}

              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800/80 text-slate-400'}`}>
                    <Radio className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-mono text-sm font-semibold tracking-wide text-slate-200">
                      {tower.tower_id}
                    </h3>
                    <p className="text-xs text-slate-400 font-sans truncate max-w-[160px]">
                      {tower.name}
                    </p>
                  </div>
                </div>

                <span className={`flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-full border uppercase tracking-wider font-mono font-medium ${healthBg}`}>
                  {healthIcon}
                  {tower.health_status}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
                <div>
                  Active Subs:{' '}
                  <span className="text-slate-200 font-bold">{totalSubs}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/10">
                    FWA: {totalFwa}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/40 text-purple-400 border border-purple-500/10">
                    Mob: {totalMobile}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
