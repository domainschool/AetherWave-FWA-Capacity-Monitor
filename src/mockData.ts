import { Tower, TelemetryLog, Trend, HealthStatus } from './types';

// Helper to generate a timestamp relative to current time
const getPastTimestampStr = (secondsAgo: number): string => {
  const date = new Date(Date.now() - secondsAgo * 1000);
  return date.toISOString().substring(11, 19); // HH:MM:SS format
};

// Generate initial history for a sector
const generateInitialHistory = (
  basePrb: number,
  baseThroughput: number,
  baseCqi: number,
  fwaSubs: number,
  mobileSubs: number,
  trendDirection: 'stable' | 'rising' | 'declining' = 'stable'
): TelemetryLog[] => {
  const history: TelemetryLog[] = [];
  let prb = basePrb;
  let throughput = baseThroughput;
  let cqi = baseCqi;

  for (let i = 14; i >= 0; i--) {
    const noise = (Math.random() - 0.5) * 2; // -1 to +1
    let trendFactor = 0;
    if (trendDirection === 'rising') {
      trendFactor = (14 - i) * 1.5;
    } else if (trendDirection === 'declining') {
      trendFactor = -(14 - i) * 1.5;
    }

    const currentPrb = Math.max(10, Math.min(100, prb + trendFactor + noise));
    const currentCqi = Math.max(1, Math.min(15, cqi - (trendFactor > 0 ? trendFactor * 0.1 : 0) + noise * 0.2));
    // Throughput drops as PRB goes up (congestion increases packet queue delays)
    const currentThroughput = Math.max(10, Math.min(1000, throughput * (1 - (currentPrb - basePrb) / 150) + noise * 10));

    history.push({
      timestamp: getPastTimestampStr(i * 3),
      prb_utilization_pct: parseFloat(currentPrb.toFixed(1)),
      throughput_mbps: parseFloat(currentThroughput.toFixed(1)),
      avg_cqi: parseFloat(currentCqi.toFixed(1)),
      fwa_subscribers_active: fwaSubs + (trendDirection === 'rising' ? Math.round((14 - i) * 1.5) : 0),
      mobile_subscribers_active: mobileSubs,
      packet_drop_rate_pct: parseFloat(Math.max(0, (currentPrb > 85 ? (currentPrb - 85) * 0.05 : 0.01) + Math.random() * 0.02).toFixed(3))
    });
  }
  return history;
};

// Calculate velocity and acceleration of PRB to predict crush risk
export const analyzeSectorTrends = (history: TelemetryLog[]): {
  trend: Trend;
  alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL';
} => {
  if (history.length < 5) {
    return { trend: 'Stable', alertLevel: 'NORMAL' };
  }

  // Take the last 5 points
  const recentLogs = history.slice(-5);
  const prbs = recentLogs.map(l => l.prb_utilization_pct);
  
  // Calculate velocities (v = P(t) - P(t-1))
  const velocities: number[] = [];
  for (let i = 1; i < prbs.length; i++) {
    velocities.push(prbs[i] - prbs[i - 1]);
  }

  // Calculate accelerations (a = v(t) - v(t-1))
  const accelerations: number[] = [];
  for (let i = 1; i < velocities.length; i++) {
    accelerations.push(velocities[i] - velocities[i - 1]);
  }

  // Average velocity & acceleration
  const avgVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
  const avgAcceleration = accelerations.reduce((sum, a) => sum + a, 0) / accelerations.length;

  const currentPrb = prbs[prbs.length - 1];

  let trend: Trend = 'Stable';
  if (avgVelocity > 1.2 && avgAcceleration > 0.2) {
    trend = 'Accelerating';
  } else if (avgVelocity > 0.4) {
    trend = 'Rising';
  }

  let alertLevel: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
  if (currentPrb > 85 && trend === 'Accelerating') {
    alertLevel = 'CRITICAL';
  } else if (currentPrb > 75 || trend === 'Accelerating' || trend === 'Rising') {
    alertLevel = 'WARNING';
  }

  return { trend, alertLevel };
};

// Initialize the 5 Towers with high-fidelity telemetry records
export const getInitialTowers = (): Tower[] => [
  {
    tower_id: 'TWR-INDY-001',
    name: 'Indianapolis Downtown - Monument Circle',
    health_status: 'Healthy',
    sectors: [
      {
        sector_id: 'SEC-1',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 42,
        active_mobile_subs: 156,
        prb_utilization_pct: 45.2,
        avg_cqi: 12.4,
        throughput_mbps: 580.4,
        packet_drop_rate_pct: 0.002,
        traffic_trend: 'Stable',
        history: generateInitialHistory(45.2, 580.4, 12.4, 42, 156, 'stable')
      },
      {
        sector_id: 'SEC-2',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 35,
        active_mobile_subs: 180,
        prb_utilization_pct: 52.8,
        avg_cqi: 11.8,
        throughput_mbps: 512.6,
        packet_drop_rate_pct: 0.005,
        traffic_trend: 'Stable',
        history: generateInitialHistory(52.8, 512.6, 11.8, 35, 180, 'stable')
      },
      {
        sector_id: 'SEC-3',
        frequency_band: 'n258 (24GHz mmWave)',
        active_fwa_subs: 95,
        active_mobile_subs: 110,
        prb_utilization_pct: 68.4,
        avg_cqi: 13.1,
        throughput_mbps: 820.1,
        packet_drop_rate_pct: 0.008,
        traffic_trend: 'Stable',
        history: generateInitialHistory(68.4, 820.1, 13.1, 95, 110, 'stable')
      }
    ]
  },
  {
    tower_id: 'TWR-INDY-002',
    name: 'Broad Ripple Entertainment District',
    health_status: 'Warning',
    sectors: [
      {
        sector_id: 'SEC-1',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 80,
        active_mobile_subs: 220,
        prb_utilization_pct: 78.5,
        avg_cqi: 9.4,
        throughput_mbps: 340.2,
        packet_drop_rate_pct: 0.018,
        traffic_trend: 'Rising',
        history: generateInitialHistory(72.0, 390.0, 10.2, 80, 220, 'rising')
      },
      {
        sector_id: 'SEC-2',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 62,
        active_mobile_subs: 195,
        prb_utilization_pct: 61.2,
        avg_cqi: 10.9,
        throughput_mbps: 420.5,
        packet_drop_rate_pct: 0.007,
        traffic_trend: 'Stable',
        history: generateInitialHistory(61.2, 420.5, 10.9, 62, 195, 'stable')
      },
      {
        sector_id: 'SEC-3',
        frequency_band: 'n258 (24GHz mmWave)',
        active_fwa_subs: 110,
        active_mobile_subs: 88,
        prb_utilization_pct: 58.1,
        avg_cqi: 12.8,
        throughput_mbps: 760.3,
        packet_drop_rate_pct: 0.004,
        traffic_trend: 'Stable',
        history: generateInitialHistory(58.1, 760.3, 12.8, 110, 88, 'stable')
      }
    ]
  },
  {
    tower_id: 'TWR-INDY-003',
    name: 'Indianapolis International Airport',
    health_status: 'Healthy',
    sectors: [
      {
        sector_id: 'SEC-1',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 10,
        active_mobile_subs: 340,
        prb_utilization_pct: 49.6,
        avg_cqi: 11.5,
        throughput_mbps: 520.1,
        packet_drop_rate_pct: 0.003,
        traffic_trend: 'Stable',
        history: generateInitialHistory(49.6, 520.1, 11.5, 10, 340, 'stable')
      },
      {
        sector_id: 'SEC-2',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 15,
        active_mobile_subs: 310,
        prb_utilization_pct: 42.4,
        avg_cqi: 12.1,
        throughput_mbps: 540.8,
        packet_drop_rate_pct: 0.001,
        traffic_trend: 'Stable',
        history: generateInitialHistory(42.4, 540.8, 12.1, 15, 310, 'stable')
      },
      {
        sector_id: 'SEC-3',
        frequency_band: 'n258 (24GHz mmWave)',
        active_fwa_subs: 5,
        active_mobile_subs: 280,
        prb_utilization_pct: 35.8,
        avg_cqi: 14.2,
        throughput_mbps: 890.3,
        packet_drop_rate_pct: 0.001,
        traffic_trend: 'Stable',
        history: generateInitialHistory(35.8, 890.3, 14.2, 5, 280, 'stable')
      }
    ]
  },
  {
    tower_id: 'TWR-INDY-004',
    name: 'Carmel Suburban Residential Zone',
    health_status: 'Healthy',
    sectors: [
      {
        sector_id: 'SEC-1',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 124,
        active_mobile_subs: 145,
        prb_utilization_pct: 69.8,
        avg_cqi: 10.1,
        throughput_mbps: 390.4,
        packet_drop_rate_pct: 0.012,
        traffic_trend: 'Stable',
        history: generateInitialHistory(69.8, 390.4, 10.1, 124, 145, 'stable')
      },
      {
        sector_id: 'SEC-2',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 132,
        active_mobile_subs: 130,
        prb_utilization_pct: 71.5,
        avg_cqi: 9.8,
        throughput_mbps: 370.2,
        packet_drop_rate_pct: 0.014,
        traffic_trend: 'Stable',
        history: generateInitialHistory(71.5, 370.2, 9.8, 132, 130, 'stable')
      },
      {
        sector_id: 'SEC-3',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 140,
        active_mobile_subs: 122,
        prb_utilization_pct: 74.2,
        avg_cqi: 9.5,
        throughput_mbps: 350.6,
        packet_drop_rate_pct: 0.015,
        traffic_trend: 'Rising',
        history: generateInitialHistory(66.0, 400.0, 10.2, 140, 122, 'rising')
      }
    ]
  },
  {
    tower_id: 'TWR-INDY-042',
    name: 'Fishers Master-Planned FWA Hotspot',
    health_status: 'Critical',
    sectors: [
      {
        sector_id: 'SEC-1',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 135,
        active_mobile_subs: 190,
        prb_utilization_pct: 76.4,
        avg_cqi: 9.6,
        throughput_mbps: 360.2,
        packet_drop_rate_pct: 0.011,
        traffic_trend: 'Stable',
        history: generateInitialHistory(76.4, 360.2, 9.6, 135, 190, 'stable')
      },
      {
        sector_id: 'SEC-2',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 142,
        active_mobile_subs: 175,
        prb_utilization_pct: 79.1,
        avg_cqi: 9.3,
        throughput_mbps: 330.5,
        packet_drop_rate_pct: 0.014,
        traffic_trend: 'Rising',
        history: generateInitialHistory(72.0, 380.0, 10.1, 142, 175, 'rising')
      },
      {
        // Deterministic target for capacity crush
        sector_id: 'SEC-3',
        frequency_band: 'n78 (3.5GHz C-Band)',
        active_fwa_subs: 160,
        active_mobile_subs: 150,
        prb_utilization_pct: 86.8,
        avg_cqi: 7.9,
        throughput_mbps: 180.4,
        packet_drop_rate_pct: 0.038,
        traffic_trend: 'Accelerating',
        history: generateInitialHistory(74.0, 310.0, 9.2, 140, 150, 'rising') // Starts high and rises
      }
    ]
  }
];

// Perform single 3-second simulation step
export const simulateTelemetryTick = (
  towers: Tower[],
  surgeActive: boolean = true
): Tower[] => {
  const timestamp = getPastTimestampStr(0);

  return towers.map(tower => {
    const sectors = tower.sectors.map(sector => {
      let prbChange = (Math.random() - 0.5) * 3; // -1.5% to +1.5% standard fluctuation
      let fwaSubChange = Math.floor(Math.random() * 3) - 1; // -1, 0, +1 subscriber changes

      // Apply FWA Prime-Time evening surge scenario: TWR-INDY-042 SEC-3 steadily compounds
      if (tower.tower_id === 'TWR-INDY-042' && sector.sector_id === 'SEC-3') {
        if (surgeActive) {
          prbChange = 4.0; // Steady compounding +4% PRB per interval
          fwaSubChange = 2; // +2 FWA subscribers per interval
        } else {
          // If surge is turned off (e.g. mitigated), it acts normally or stabilizes
          prbChange = (Math.random() - 0.5) * 2 - 0.5; // slight downward drift
          fwaSubChange = Math.floor(Math.random() * 2) - 1;
        }
      }

      // Calculate new subscriber numbers
      const active_fwa_subs = Math.max(0, sector.active_fwa_subs + fwaSubChange);
      // Mobile subscribers shift slightly
      const mobileSubChange = Math.floor(Math.random() * 5) - 2; // -2 to +2
      const active_mobile_subs = Math.max(10, sector.active_mobile_subs + mobileSubChange);

      // Mutate metrics with bounds
      const prb_utilization_pct = parseFloat(Math.max(10, Math.min(100, sector.prb_utilization_pct + prbChange)).toFixed(1));
      
      // CQI degrades when PRB goes too high (interference, congestion, scheduling latency)
      let cqiChange = (Math.random() - 0.5) * 0.2;
      if (prb_utilization_pct > 80) {
        cqiChange -= 0.15; // downward pressure
      }
      const avg_cqi = parseFloat(Math.max(1.0, Math.min(15.0, sector.avg_cqi + cqiChange)).toFixed(1));

      // Throughput is calculated: decreases as PRB gets high and CQI drops
      // Formula: Throughput = MaxCapacityForBand * (1 - PRB_utilization/100) + noise
      // We clamp it. SEC-3 mmWave has a higher base capacity (e.g., 900Mbps max) vs C-band (600Mbps max)
      const isMmWave = sector.frequency_band.includes('mmWave');
      const maxBandwidth = isMmWave ? 950 : 600;
      
      // Quality factor (CQI / 15)
      const qFactor = avg_cqi / 15.0;
      const calculatedThroughput = maxBandwidth * (1.05 - prb_utilization_pct / 100) * qFactor;
      const noise = (Math.random() - 0.5) * 15;
      const throughput_mbps = parseFloat(Math.max(10, Math.min(maxBandwidth, calculatedThroughput + noise)).toFixed(1));

      // Packet drop rate starts increasing exponentially when PRB goes above 80%
      const packet_drop_rate_pct = parseFloat(Math.max(
        0.001,
        (prb_utilization_pct > 80 ? Math.pow((prb_utilization_pct - 80) / 10, 2) * 0.08 : 0.005) + Math.random() * 0.003
      ).toFixed(3));

      // Append new telemetry entry to history
      const newLog: TelemetryLog = {
        timestamp,
        prb_utilization_pct,
        throughput_mbps,
        avg_cqi,
        fwa_subscribers_active: active_fwa_subs,
        mobile_subscribers_active: active_mobile_subs,
        packet_drop_rate_pct
      };

      const updatedHistory = [...sector.history, newLog].slice(-15);

      // Perform derivative calculations
      const trendAnalysis = analyzeSectorTrends(updatedHistory);

      return {
        ...sector,
        active_fwa_subs,
        active_mobile_subs,
        prb_utilization_pct,
        avg_cqi,
        throughput_mbps,
        packet_drop_rate_pct,
        traffic_trend: trendAnalysis.trend,
        history: updatedHistory,
        acceleration_alert_level: trendAnalysis.alertLevel
      };
    });

    // Re-calculate overall tower health status based on child sectors
    let health_status: HealthStatus = 'Healthy';
    const hasCritical = sectors.some(s => s.prb_utilization_pct > 85 || s.acceleration_alert_level === 'CRITICAL');
    const hasWarning = sectors.some(s => s.prb_utilization_pct > 75 || s.acceleration_alert_level === 'WARNING');

    if (hasCritical) {
      health_status = 'Critical';
    } else if (hasWarning) {
      health_status = 'Warning';
    }

    return {
      ...tower,
      health_status,
      sectors
    };
  });
};
