export type Trend = 'Stable' | 'Rising' | 'Accelerating';

export type HealthStatus = 'Healthy' | 'Warning' | 'Critical';

export interface TelemetryLog {
  timestamp: string;
  prb_utilization_pct: number;
  throughput_mbps: number;
  avg_cqi: number;
  fwa_subscribers_active: number;
  mobile_subscribers_active: number;
  packet_drop_rate_pct: number;
}

export interface Sector {
  sector_id: string;
  frequency_band: string;
  active_fwa_subs: number;
  active_mobile_subs: number;
  prb_utilization_pct: number;
  avg_cqi: number;
  throughput_mbps: number;
  packet_drop_rate_pct: number;
  traffic_trend: Trend;
  history: TelemetryLog[];
  acceleration_alert_level?: 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface Tower {
  tower_id: string;
  name: string;
  health_status: HealthStatus;
  sectors: Sector[];
}
