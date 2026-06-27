import React, { useState, useEffect } from 'react';
import { getInitialTowers, simulateTelemetryTick } from './mockData';
import { Sidebar } from './components/Sidebar';
import { SectorDetail } from './components/SectorDetail';
import { 
  Radio, 
  RefreshCw, 
  Clock, 
  Settings, 
  Activity, 
  Database,
  Flame,
  AlertOctagon,
  Users,
  CheckCircle2
} from 'lucide-react';

export const App: React.FC = () => {
  const [towers, setTowers] = useState(() => getInitialTowers());
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  
  // Simulation controls
  const [surgeActive, setSurgeActive] = useState(true);
  const [isApiMode, setIsApiMode] = useState(false); // Mode toggle: Local Emulation vs Live Backend
  const [isLoading, setIsLoading] = useState(false);
  const [utcTime, setUtcTime] = useState('');
  const [showResetToast, setShowResetToast] = useState(false);

  // Live UTC Clock updater
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Telemetry local stream interval (every 3 seconds)
  useEffect(() => {
    if (isApiMode) return;

    const interval = setInterval(() => {
      setTowers(prevTowers => simulateTelemetryTick(prevTowers, surgeActive));
    }, 3000);

    return () => clearInterval(interval);
  }, [surgeActive, isApiMode]);

  // Telemetry live server API polling (every 3 seconds)
  useEffect(() => {
    if (!isApiMode) {
      setIsLoading(false);
      return;
    }

    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/api/telemetry');
        if (response.ok) {
          const data = await response.json();
          setTowers(data);
        }
      } catch (error) {
        console.error("Error fetching live telemetry from FastAPI backend:", error);
      } finally {
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchTelemetry();

    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, [isApiMode]);

  // Reset simulation function
  const handleResetSimulation = () => {
    if (isApiMode) {
      // Re-fetch live data to align with backend
      setIsLoading(true);
      fetch('http://127.0.0.1:8000/api/telemetry')
        .then(res => res.json())
        .then(data => {
          setTowers(data);
          setIsLoading(false);
        })
        .catch(err => console.error(err));
    } else {
      setTowers(getInitialTowers());
      setSurgeActive(true);
    }
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 3000);
  };

  // Find currently selected tower
  const selectedTower = towers.find(t => t.tower_id === selectedTowerId) || null;

  // Handle selected tower change
  const handleSelectTower = (towerId: string) => {
    setSelectedTowerId(towerId);
    // Auto-select the first sector of the tower to make UX smoother
    const tower = towers.find(t => t.tower_id === towerId);
    if (tower && tower.sectors.length > 0) {
      setSelectedSectorId(tower.sectors[0].sector_id);
    } else {
      setSelectedSectorId(null);
    }
  };

  // Aggregate Dashboard Statistics
  const totalTowersCount = towers.length;
  const criticalCount = towers.filter(t => t.health_status === 'Critical').length;
  const warningCount = towers.filter(t => t.health_status === 'Warning').length;
  
  let totalFwaSubs = 0;
  let totalMobileSubs = 0;
  towers.forEach(t => {
    t.sectors.forEach(s => {
      totalFwaSubs += s.active_fwa_subs;
      totalMobileSubs += s.active_mobile_subs;
    });
  });

  return (
    <div className="min-h-screen bg-slate-950 noc-grid text-slate-100 flex flex-col font-sans relative">
      {/* Background radial overlay to focus glow */}
      <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-cyan-950/15 via-transparent to-transparent pointer-events-none" />

      {/* Main Top Header Bar */}
      <header className="glass-panel border-b border-slate-900 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)] animate-flow-glow">
            <Radio className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight font-outfit bg-gradient-to-r from-slate-100 via-slate-200 to-cyan-400 bg-clip-text text-transparent">
              AetherWave: FWA Capacity Monitor
            </h1>
            <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase mt-0.5">
              5G RAN Congestion Telemetry NOC Interface
            </p>
          </div>
        </div>

        {/* Status Indicators & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center rounded-lg bg-slate-900/60 p-0.5 border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setIsApiMode(false)}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 ${
                !isApiMode 
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Local Emulation
            </button>
            <button
              onClick={() => setIsApiMode(true)}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 flex items-center gap-1.5 ${
                isApiMode 
                  ? 'bg-cyan-500/15 text-cyan-400 font-bold border border-cyan-500/10' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="FastAPI Live Engine (MVP 2 Tier)"
            >
              <Database className="h-3.5 w-3.5" />
              Live Server
            </button>
          </div>

          {/* Clock */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/40 border border-slate-900 text-xs font-mono text-slate-400 shadow-inner">
            <Clock className="h-3.5 w-3.5 text-cyan-400/80" />
            <span>{utcTime || 'Loading UTC Time...'}</span>
          </div>

          {/* Trigger Surge Scenario Toggle */}
          <button
            onClick={() => setSurgeActive(!surgeActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold font-mono tracking-wide transition-all duration-200 ${
              surgeActive 
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]' 
                : 'bg-slate-900/40 text-slate-500 border-slate-800'
            }`}
            title={surgeActive ? 'Disable TWR-INDY-042 active FWA congestion surge' : 'Enable TWR-INDY-042 active FWA congestion surge'}
          >
            <Flame className={`h-3.5 w-3.5 ${surgeActive ? 'animate-bounce' : ''}`} />
            Surge: {surgeActive ? 'ON' : 'OFF'}
          </button>

          {/* Reset Action */}
          <button
            onClick={handleResetSimulation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-xs font-semibold font-mono tracking-wide text-slate-300 transition-all duration-200 active:scale-[0.98]"
            title="Reset telemetry counters"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset Stream
          </button>
        </div>
      </header>

      {/* Global Status Bar Row */}
      <section className="px-6 py-4 bg-slate-950/40 border-b border-slate-900/60 z-10 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
            <Radio className="h-4 w-4 text-cyan-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-mono tracking-wider block">Total RAN Nodes</span>
            <span className="text-sm font-semibold font-mono text-slate-200">{totalTowersCount} Online</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
            <Users className="h-4 w-4 text-purple-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-mono tracking-wider block">FWA / Mobile Active</span>
            <span className="text-sm font-semibold font-mono text-slate-200">
              {totalFwaSubs} <span className="text-slate-500 text-xs font-normal">FWA</span> / {totalMobileSubs} <span className="text-slate-500 text-xs font-normal">Mob</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
            <AlertOctagon className="h-4 w-4 text-rose-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-mono tracking-wider block">Critical Sectors</span>
            <span className={`text-sm font-semibold font-mono ${criticalCount > 0 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
              {criticalCount} Anomalies
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-900 rounded-lg text-slate-400">
            <Settings className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <span className="text-[10px] uppercase text-slate-500 font-mono tracking-wider block">Warning Sectors</span>
            <span className="text-sm font-semibold font-mono text-slate-200">{warningCount} Flagged</span>
          </div>
        </div>
      </section>

      {/* Main Dashboard Layout Container */}
      <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10 items-stretch overflow-hidden">
        {/* Sidebar Left Column */}
        <section className="lg:col-span-4 xl:col-span-3 flex flex-col h-full min-h-[400px]">
          {isLoading ? (
            <div className="glass-panel rounded-2xl p-5 space-y-4 h-full border border-slate-800 shimmer">
              <div className="h-6 w-24 bg-slate-800/80 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="h-20 bg-slate-900/40 border border-slate-800/40 rounded-xl p-4 space-y-2">
                    <div className="h-4 w-1/3 bg-slate-800/60 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-slate-800/40 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Sidebar
              towers={towers}
              selectedTowerId={selectedTowerId}
              onSelectTower={handleSelectTower}
            />
          )}
        </section>

        {/* Detailed View Pane Right Column */}
        <section className="lg:col-span-8 xl:col-span-9 flex flex-col justify-start">
          {isLoading ? (
            <div className="space-y-6 h-full shimmer">
              <div className="glass-panel rounded-2xl p-5 border border-slate-800 h-20 animate-pulse bg-slate-900/20" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-panel rounded-2xl p-5 border border-slate-800 h-40 animate-pulse bg-slate-900/20" />
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 glass-panel rounded-2xl p-5 border border-slate-800 h-64 animate-pulse bg-slate-900/20" />
                <div className="lg:col-span-5 glass-panel rounded-2xl p-5 border border-slate-800 h-64 animate-pulse bg-slate-900/20" />
              </div>
            </div>
          ) : (
            <SectorDetail
              selectedTower={selectedTower}
              selectedSectorId={selectedSectorId}
              onSelectSector={setSelectedSectorId}
            />
          )}
        </section>
      </main>

      {/* Reset Toast Message */}
      {showResetToast && (
        <div className="fixed bottom-6 right-6 bg-slate-900 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-mono text-xs z-50 animate-bounce">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <span>Telemetry streams successfully reset to baseline.</span>
        </div>
      )}

      {/* Footer */}
      <footer className="glass-panel border-t border-slate-900 py-3 px-6 text-center text-[10px] text-slate-500 font-mono flex items-center justify-between">
        <span>AETHERWAVE Telemetry Engine v0.1.0 (PROTOTYPE)</span>
        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-cyan-400 animate-pulse" />
          Channel Core: 3GPP Rel-17 Compliant Emulation
        </span>
      </footer>
    </div>
  );
};
