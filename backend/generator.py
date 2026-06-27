import time
import random
import requests
from datetime import datetime

# Server details
API_URL = "http://127.0.0.1:8000/api/telemetry/submit"

# Initialize local state matching baseline models
towers = [
    {
        "tower_id": "TWR-INDY-001",
        "sectors": [
            {"sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 42, "active_mobile_subs": 156, "prb_utilization_pct": 45.2, "avg_cqi": 12.4},
            {"sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 35, "active_mobile_subs": 180, "prb_utilization_pct": 52.8, "avg_cqi": 11.8},
            {"sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)", "active_fwa_subs": 95, "active_mobile_subs": 110, "prb_utilization_pct": 68.4, "avg_cqi": 13.1}
        ]
    },
    {
        "tower_id": "TWR-INDY-002",
        "sectors": [
            {"sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 80, "active_mobile_subs": 220, "prb_utilization_pct": 78.5, "avg_cqi": 9.4},
            {"sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 62, "active_mobile_subs": 195, "prb_utilization_pct": 61.2, "avg_cqi": 10.9},
            {"sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)", "active_fwa_subs": 110, "active_mobile_subs": 88, "prb_utilization_pct": 58.1, "avg_cqi": 12.8}
        ]
    },
    {
        "tower_id": "TWR-INDY-003",
        "sectors": [
            {"sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 10, "active_mobile_subs": 340, "prb_utilization_pct": 49.6, "avg_cqi": 11.5},
            {"sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 15, "active_mobile_subs": 310, "prb_utilization_pct": 42.4, "avg_cqi": 12.1},
            {"sector_id": "SEC-3", "frequency_band": "n258 (24GHz mmWave)", "active_fwa_subs": 5, "active_mobile_subs": 280, "prb_utilization_pct": 35.8, "avg_cqi": 14.2}
        ]
    },
    {
        "tower_id": "TWR-INDY-004",
        "sectors": [
            {"sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 124, "active_mobile_subs": 145, "prb_utilization_pct": 69.8, "avg_cqi": 10.1},
            {"sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 132, "active_mobile_subs": 130, "prb_utilization_pct": 71.5, "avg_cqi": 9.8},
            {"sector_id": "SEC-3", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 140, "active_mobile_subs": 122, "prb_utilization_pct": 74.2, "avg_cqi": 9.5}
        ]
    },
    {
        "tower_id": "TWR-INDY-042",
        "sectors": [
            {"sector_id": "SEC-1", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 135, "active_mobile_subs": 190, "prb_utilization_pct": 76.4, "avg_cqi": 9.6},
            {"sector_id": "SEC-2", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 142, "active_mobile_subs": 175, "prb_utilization_pct": 79.1, "avg_cqi": 9.3},
            {"sector_id": "SEC-3", "frequency_band": "n78 (3.5GHz C-Band)", "active_fwa_subs": 160, "active_mobile_subs": 150, "prb_utilization_pct": 86.8, "avg_cqi": 7.9}
        ]
    }
]

print("=== AETHERWAVE TELEMETRY STREAM GENERATOR STARTING ===")
print(f"Targeting intake receiver: {API_URL}")
print("Press Ctrl+C to stop streaming logs.")
print("=====================================================")

try:
    while True:
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        for tower in towers:
            tower_id = tower["tower_id"]
            for sector in tower["sectors"]:
                sector_id = sector["sector_id"]
                
                # Default noise mutations
                prb_change = random.uniform(-1.5, 1.5)
                fwa_change = random.choice([-1, 0, 1])
                mob_change = random.choice([-2, -1, 0, 1, 2])
                
                # Deterministic FWA Compound Surge on TWR-INDY-042 SEC-3
                if tower_id == "TWR-INDY-042" and sector_id == "SEC-3":
                    prb_change = 4.0
                    fwa_change = 2
                    
                # Update subscribers
                sector["active_fwa_subs"] = max(0, sector["active_fwa_subs"] + fwa_change)
                sector["active_mobile_subs"] = max(10, sector["active_mobile_subs"] + mob_change)
                
                # Update PRB with clamp
                sector["prb_utilization_pct"] = max(10.0, min(100.0, sector["prb_utilization_pct"] + prb_change))
                prb = sector["prb_utilization_pct"]
                
                # Adjust CQI based on congestion
                cqi_change = random.uniform(-0.1, 0.1)
                if prb > 80.0:
                    cqi_change -= 0.15
                sector["avg_cqi"] = max(1.0, min(15.0, sector["avg_cqi"] + cqi_change))
                cqi = sector["avg_cqi"]
                
                # Calculate Throughput based on band and congestion
                is_mmwave = "mmWave" in sector["frequency_band"]
                max_bw = 950.0 if is_mmwave else 600.0
                q_factor = cqi / 15.0
                calc_throughput = max_bw * (1.05 - prb / 100.0) * q_factor
                throughput = max(10.0, min(max_bw, calc_throughput + random.uniform(-10.0, 10.0)))
                
                # Calculate packet drop rate
                packet_drop = max(
                    0.001,
                    ((prb - 80.0) ** 2 * 0.08 if prb > 80.0 else 0.005) + random.uniform(0.001, 0.004)
                )
                
                # Build payload
                payload = {
                    "timestamp": timestamp,
                    "tower_id": tower_id,
                    "sector_id": sector_id,
                    "frequency_band": sector["frequency_band"],
                    "fwa_subscribers_active": int(sector["active_fwa_subs"]),
                    "mobile_subscribers_active": int(sector["active_mobile_subs"]),
                    "prb_utilization_pct": round(prb, 1),
                    "avg_cqi": round(cqi, 1),
                    "downlink_throughput_mbps": round(throughput, 1),
                    "packet_drop_rate_pct": round(packet_drop, 3)
                }
                
                # Submit POST
                try:
                    res = requests.post(API_URL, json=payload, timeout=2.0)
                    if res.status_code == 200:
                        data = res.json()
                        if tower_id == "TWR-INDY-042" and sector_id == "SEC-3":
                            print(f"[{timestamp}] [SURGE] {tower_id} - {sector_id} submitted: PRB={payload['prb_utilization_pct']}%, FWA={payload['fwa_subscribers_active']} | Alert: {data.get('alert')}")
                    else:
                        print(f"Error submitting data: {res.status_code} - {res.text}")
                except requests.exceptions.RequestException as e:
                    print(f"Connection error to FastAPI server: {str(e)}")
                    
        # Wait 3 seconds for next interval tick
        time.sleep(3)
        
except KeyboardInterrupt:
    print("\nTelemetry generator stopped.")
