import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { TelemetryLog } from '../types';

interface TelemetryChartProps {
  history: TelemetryLog[];
}

export const TelemetryChart = ({ history }: TelemetryChartProps) => {
  return (
    <div className="w-full h-[280px] bg-slate-950/60 p-4 rounded-xl border border-slate-900/60 relative">
      <div className="absolute top-2 left-4 flex gap-4 text-xs font-mono">
        <span className="flex items-center gap-1.5 text-amber-500">
          <span className="w-2.5 h-2.5 bg-amber-500/20 border border-amber-500/50 rounded-sm" />
          PRB Utilization (%)
        </span>
        <span className="flex items-center gap-1.5 text-blue-400">
          <span className="w-2.5 h-0.5 bg-blue-400" />
          Downlink Throughput (Mbps)
        </span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={history}
          margin={{ top: 20, right: -5, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPrb" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
          
          <XAxis
            dataKey="timestamp"
            stroke="#64748b"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            tickLine={false}
            dy={8}
          />
          
          {/* Left Y Axis for PRB */}
          <YAxis
            yAxisId="left"
            domain={[0, 100]}
            stroke="#f59e0b"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          
          {/* Right Y Axis for Throughput */}
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#3b82f6"
            fontSize={10}
            fontFamily="JetBrains Mono, monospace"
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}M`}
          />
          
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#334155',
              borderRadius: '8px',
              color: '#f8fafc',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '11px',
            }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
          />

          <Area
            yAxisId="left"
            type="monotone"
            dataKey="prb_utilization_pct"
            stroke="#f59e0b"
            strokeWidth={1.5}
            fillOpacity={1}
            fill="url(#colorPrb)"
            name="PRB Utilization"
          />

          <Line
            yAxisId="right"
            type="monotone"
            dataKey="throughput_mbps"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
            name="Throughput"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
