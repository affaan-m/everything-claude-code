#!/usr/bin/env python3
"""
Generate a self-contained HTML file with embedded animation data.

This creates a single HTML file that can be opened directly in any browser
without needing a server or external JSON file (CORS-safe).
"""

from __future__ import annotations

import json
from pathlib import Path

EXAMPLE_DIR = Path(__file__).parent
DATA_FILE = EXAMPLE_DIR / "output" / "animation_data.json"
OUTPUT_FILE = EXAMPLE_DIR / "output" / "interactive_forecast.html"


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TimesFM Interactive Forecast Animation</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
            min-height: 100vh;
            color: #e0e0e0;
            padding: 20px;
        }}
        
        .container {{ max-width: 1200px; margin: 0 auto; }}
        
        header {{ text-align: center; margin-bottom: 30px; }}
        
        h1 {{
            font-size: 2rem;
            margin-bottom: 10px;
            background: linear-gradient(90deg, #60a5fa, #a78bfa);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .subtitle {{ color: #9ca3af; font-size: 1.1rem; }}
        
        .chart-container {{
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }}
        
        #chart {{ width: 100% !important; height: 450px !important; }}
        
        .controls {{
            display: flex;
            flex-direction: column;
            gap: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 16px;
            padding: 20px;
        }}
        
        .slider-container {{ display: flex; flex-direction: column; gap: 10px; }}
        
        .slider-label {{ display: flex; justify-content: space-between; align-items: center; }}
        .slider-label span {{ font-size: 0.9rem; color: #9ca3af; }}
        .slider-label .value {{ font-weight: 600; color: #60a5fa; font-size: 1.1rem; }}
        
        input[type="range"] {{
            width: 100%; height: 8px; border-radius: 4px;
            background: #374151; outline: none; -webkit-appearance: none;
        }}
        
        input[type="range"]::-webkit-slider-thumb {{
            -webkit-appearance: none;
            width: 24px; height: 24px; border-radius: 50%;
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            cursor: pointer;
            box-shadow: 0 2px 10px rgba(96, 165, 250, 0.5);
        }}
        
        .buttons {{ display: flex; gap: 10px; flex-wrap: wrap; }}
        
        button {{
            flex: 1; min-width: 100px;
            padding: 12px 20px;
            border: none; border-radius: 8px;
            font-size: 1rem; font-weight: 600;
            cursor: pointer; transition: all 0.2s ease;
        }}
        
        .btn-primary {{
            background: linear-gradient(135deg, #60a5fa, #a78bfa);
            color: white;
        }}
        .btn-primary:hover {{ transform: translateY(-2px); box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4); }}
        
        .btn-secondary {{ background: #374151; color: #e0e0e0; }}
        .btn-secondary:hover {{ background: #4b5563; }}
        
        .stats {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }}
        
        .stat-card {{
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 15px;
            text-align: center;
        }}
        .stat-card .label {{ font-size: 0.8rem; color: #9ca3af; margin-bottom: 5px; }}
        .stat-card .value {{ font-size: 1.3rem; font-weight: 600; color: #60a5fa; }}
        
        .legend {{
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }}
        
        .legend-item {{ display: flex; align-items: center; gap: 8px; font-size: 0.85rem; }}
        .legend-color {{ width: 16px; height: 16px; border-radius: 4px; }}
        
        footer {{
            text-align: center;
            margin-top: 30px;
            color: #6b7280;
            font-size: 0.9rem;
        }}
        footer a {{ color: #60a5fa; text-decoration: none; }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>TimesFM Forecast Evolution</h1>
            <p class="subtitle">Watch the forecast evolve as more data is added — forecasts extend to 2025-12</p>
        </header>
        
        <div class="chart-container">
            <canvas id="chart"></canvas>
        </div>
        
        <div class="controls">
            <div class="slider-container">
                <div class="slider-label">
                    <span>Data Points Used</span>
                    <span class="value" id="points-value">12 / 36</span>
                </div>
                <input type="range" id="slider" min="0" max="24" value="0" step="1">
                <div class="slider-label">
                    <span>2022-01</span>
                    <span id="date-end">Using data through 2022-12</span>
                </div>
            </div>
            
            <div class="buttons">
                <button class="btn-primary" id="play-btn">▶ Play</button>
                <button class="btn-secondary" id="reset-btn">↺ Reset</button>
            </div>
            
            <div class="stats">
                <div class="stat-card">
                    <div class="label">Forecast Mean</div>
                    <div class="value" id="stat-mean">0.86°C</div>
                </div>
                <div class="stat-card">
                    <div class="label">Forecast Horizon</div>
                    <div class="value" id="stat-horizon">36 months</div>
                </div>
                <div class="stat-card">
                    <div class="label">Forecast Max</div>
                    <div class="value" id="stat-max">--</div>
                </div>
                <div class="stat-card">
                    <div class="label">Forecast Min</div>
                    <div class="value" id="stat-min">--</div>
                </div>
            </div>
            
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #9ca3af;"></div>
                    <span>All Observed Data</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #fca5a5;"></div>
                    <span>Final Forecast (reference)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #3b82f6;"></div>
                    <span>Data Used</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #ef4444;"></div>
                    <span>Current Forecast</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: rgba(239, 68, 68, 0.25);"></div>
                    <span>80% CI</span>
                </div>
            </div>
        </div>
        
        <footer>
            <p>TimesFM 1.0 (200M) PyTorch • <a href="https://github.com/google-research/timesfm">Google Research</a></p>
        </footer>
    </div>

    <script>
        // Embedded animation data (no external fetch needed)
        const animationData = {data_json};
        
        let chart = null;
        let isPlaying = false;
        let playInterval = null;
        let currentStep = 0;

        // Fixed axis extents
        let allDates = [];
        let yMin = 0.7;
        let yMax = 1.55;

        function initChart() {{
            const ctx = document.getElementById('chart').getContext('2d');
            
            // Calculate fixed extents
            const finalStep = animationData.animation_steps[animationData.animation_steps.length - 1];
            allDates = [
                ...animationData.actual_data.dates,
                ...finalStep.forecast_dates
            ];
            
            // Y extent from all values
            const allValues = [
                ...animationData.actual_data.values,
                ...finalStep.point_forecast,
                ...finalStep.q10,
                ...finalStep.q90
            ];
            yMin = Math.min(...allValues) - 0.05;
            yMax = Math.max(...allValues) + 0.05;
            
            chart = new Chart(ctx, {{
                type: 'line',
                data: {{
                    labels: allDates,
                    datasets: [
                        {{
                            label: 'All Observed',
                            data: animationData.actual_data.values.map((v, i) => ({{x: animationData.actual_data.dates[i], y: v}})),
                            borderColor: '#9ca3af',
                            borderWidth: 1,
                            pointRadius: 2,
                            pointBackgroundColor: '#9ca3af',
                            fill: false,
                            tension: 0.1,
                            order: 1,
                        }},
                        {{
                            label: 'Final Forecast',
                            data: [...Array(animationData.actual_data.dates.length).fill(null), ...finalStep.point_forecast],
                            borderColor: '#fca5a5',
                            borderWidth: 1,
                            borderDash: [4, 4],
                            pointRadius: 2,
                            pointBackgroundColor: '#fca5a5',
                            fill: false,
                            tension: 0.1,
                            order: 2,
                        }},
                        {{
                            label: 'Data Used',
                            data: [],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#3b82f6',
                            fill: false,
                            tension: 0.1,
                            order: 10,
                        }},
                        {{
                            label: '90% CI Lower',
                            data: [],
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            fill: '+1',
                            pointRadius: 0,
                            tension: 0.1,
                            order: 5,
                        }},
                        {{
                            label: '90% CI Upper',
                            data: [],
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(239, 68, 68, 0.08)',
                            fill: false,
                            pointRadius: 0,
                            tension: 0.1,
                            order: 5,
                        }},
                        {{
                            label: '80% CI Lower',
                            data: [],
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            fill: '+1',
                            pointRadius: 0,
                            tension: 0.1,
                            order: 6,
                        }},
                        {{
                            label: '80% CI Upper',
                            data: [],
                            borderColor: 'transparent',
                            backgroundColor: 'rgba(239, 68, 68, 0.2)',
                            fill: false,
                            pointRadius: 0,
                            tension: 0.1,
                            order: 6,
                        }},
                        {{
                            label: 'Forecast',
                            data: [],
                            borderColor: '#ef4444',
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            borderWidth: 2.5,
                            pointRadius: 4,
                            pointBackgroundColor: '#ef4444',
                            fill: false,
                            tension: 0.1,
                            order: 7,
                        }},
                    ]
                }},
                options: {{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {{ intersect: false, mode: 'index' }},
                    plugins: {{
                        legend: {{ display: false }},
                        tooltip: {{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#fff',
                            bodyColor: '#fff',
                            padding: 12,
                        }},
                    }},
                    scales: {{
                        x: {{
                            grid: {{ color: 'rgba(255, 255, 255, 0.05)' }},
                            ticks: {{ color: '#9ca3af', maxRotation: 45, minRotation: 45 }},
                        }},
                        y: {{
                            grid: {{ color: 'rgba(255, 255, 255, 0.05)' }},
                            ticks: {{
                                color: '#9ca3af',
                                callback: v => v.toFixed(2) + '°C'
                            }},
                            min: yMin,
                            max: yMax,
                        }},
                    }},
                    animation: {{ duration: 150 }},
                }},
            }});
        }}

        function updateChart(stepIndex) {{
            if (!animationData || !chart) return;
            
            const step = animationData.animation_steps[stepIndex];
            const finalStep = animationData.animation_steps[animationData.animation_steps.length - 1];
            const actual = animationData.actual_data;
            
            // Build data arrays for each dataset
            const nHist = step.historical_dates.length;
            const nForecast = step.forecast_dates.length;
            const nActual = actual.dates.length;
            const nFinalForecast = finalStep.forecast_dates.length;
            const totalPoints = nActual + nFinalForecast;
            
            // Dataset 0: All observed (always full)
            chart.data.datasets[0].data = actual.values.map((v, i) => ({{x: actual.dates[i], y: v}}));
            
            // Dataset 1: Final forecast reference (always full)
            chart.data.datasets[1].data = [
                ...Array(nActual).fill(null),
                ...finalStep.point_forecast
            ];
            
            // Dataset 2: Data used (historical only)
            const dataUsed = [];
            for (let i = 0; i < totalPoints; i++) {{
                if (i < nHist) {{
                    dataUsed.push(step.historical_values[i]);
                }} else {{
                    dataUsed.push(null);
                }}
            }}
            chart.data.datasets[2].data = dataUsed;
            
            // Datasets 3-6: CIs (forecast only)
            const forecastOffset = nActual;
            const q90Lower = [];
            const q90Upper = [];
            const q80Lower = [];
            const q80Upper = [];
            
            for (let i = 0; i < totalPoints; i++) {{
                const forecastIdx = i - forecastOffset;
                if (forecastIdx >= 0 && forecastIdx < nForecast) {{
                    q90Lower.push(step.q10[forecastIdx]);
                    q90Upper.push(step.q90[forecastIdx]);
                    q80Lower.push(step.q20[forecastIdx]);
                    q80Upper.push(step.q80[forecastIdx]);
                }} else {{
                    q90Lower.push(null);
                    q90Upper.push(null);
                    q80Lower.push(null);
                    q80Upper.push(null);
                }}
            }}
            chart.data.datasets[3].data = q90Lower;
            chart.data.datasets[4].data = q90Upper;
            chart.data.datasets[5].data = q80Lower;
            chart.data.datasets[6].data = q80Upper;
            
            // Dataset 7: Forecast line
            const forecastData = [];
            for (let i = 0; i < totalPoints; i++) {{
                const forecastIdx = i - forecastOffset;
                if (forecastIdx >= 0 && forecastIdx < nForecast) {{
                    forecastData.push(step.point_forecast[forecastIdx]);
                }} else {{
                    forecastData.push(null);
                }}
            }}
            chart.data.datasets[7].data = forecastData;
            
            chart.update('none');
            
            // Update UI
            document.getElementById('slider').value = stepIndex;
            document.getElementById('points-value').textContent = `${{step.n_points}} / 36`;
            document.getElementById('date-end').textContent = `Using data through ${{step.last_historical_date}}`;
            
            // Stats
            const mean = (step.point_forecast.reduce((a, b) => a + b, 0) / step.point_forecast.length).toFixed(3);
            const max = Math.max(...step.point_forecast).toFixed(3);
            const min = Math.min(...step.point_forecast).toFixed(3);
            
            document.getElementById('stat-mean').textContent = mean + '°C';
            document.getElementById('stat-horizon').textContent = step.horizon + ' months';
            document.getElementById('stat-max').textContent = max + '°C';
            document.getElementById('stat-min').textContent = min + '°C';
            
            currentStep = stepIndex;
        }}

        document.getElementById('slider').addEventListener('input', e => {{
            updateChart(parseInt(e.target.value));
        }});

        document.getElementById('play-btn').addEventListener('click', () => {{
            const btn = document.getElementById('play-btn');
            if (isPlaying) {{
                clearInterval(playInterval);
                btn.textContent = '▶ Play';
                isPlaying = false;
            }} else {{
                btn.textContent = '⏸ Pause';
                isPlaying = true;
                if (currentStep >= animationData.animation_steps.length - 1) currentStep = 0;
                playInterval = setInterval(() => {{
                    if (currentStep >= animationData.animation_steps.length - 1) {{
                        clearInterval(playInterval);
                        document.getElementById('play-btn').textContent = '▶ Play';
                        isPlaying = false;
                    }} else {{
                        currentStep++;
                        updateChart(currentStep);
                    }}
                }}, 400);
            }}
        }});

        document.getElementById('reset-btn').addEventListener('click', () => {{
            if (isPlaying) {{
                clearInterval(playInterval);
                document.getElementById('play-btn').textContent = '▶ Play';
                isPlaying = false;
            }}
            updateChart(0);
        }});

        // Initialize on load
        initChart();
        updateChart(0);
    </script>
</body>
</html>
"""


def main() -> None:
    print("=" * 60)
    print("  GENERATING SELF-CONTAINED HTML")
    print("=" * 60)

    # Load animation data
    with open(DATA_FILE) as f:
        data = json.load(f)

    # Generate HTML with embedded data
    html_content = HTML_TEMPLATE.format(data_json=json.dumps(data, indent=2))

    # Write output
    with open(OUTPUT_FILE, "w") as f:
        f.write(html_content)

    size_kb = OUTPUT_FILE.stat().st_size / 1024
    print(f"\n✅ Generated: {OUTPUT_FILE}")
    print(f"   File size: {size_kb:.1f} KB")
    print(f"   Fully self-contained — no external dependencies")


if __name__ == "__main__":
    main()
