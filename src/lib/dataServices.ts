const NASA_POWER_BASE_URL = 'https://power.larc.nasa.gov/api/temporal/daily/point';
const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export async function getNasaIrradiance(lat: number, lon: number) {
  const end = new Date();
  const start = new Date();
  start.setFullYear(end.getFullYear() - 1);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
  
  try {
    const response = await fetch(
      `${NASA_POWER_BASE_URL}?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${lon}&latitude=${lat}&start=${formatDate(start)}&end=${formatDate(end)}&format=JSON`
    );
    const data = await response.json();
    const values = Object.values(data.properties.parameter.ALLSKY_SFC_SW_DWN) as number[];
    const avg = values.filter(v => v > 0).reduce((a, b) => a + b, 0) / values.length;
    return avg || 5.2; // Default for India if fetch fails
  } catch (error) {
    console.error('NASA API Error:', error);
    return 5.2; 
  }
}

export async function getLiveWeather(lat: number, lon: number) {
  try {
    const response = await fetch(
      `${OPEN_METEO_BASE_URL}?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover&forecast_days=1`
    );
    const data = await response.json();
    return {
      temp: data.current.temperature_2m,
      cloudiness: data.current.cloud_cover,
      status: data.current.cloud_cover > 50 ? 'Cloudy' : 'Clear',
      humidity: data.current.relative_humidity_2m,
      windSpeed: data.current.wind_speed_10m,
    };
  } catch (error) {
    console.error('Open-Meteo API Error:', error);
    return null;
  }
}

/**
 * Calculates theoretical solar output for a given irradiance and system size.
 * Formula: P = A * r * H * PR
 * A = Total panel area (m2)
 * r = solar panel efficiency (%)
 * H = Annual average solar radiation on tilted panels (shadeless)
 * PR = Performance ratio (coefficient for losses)
 */
export function calculateSolarYield(kw: number, irradiance: number, temp: number) {
  const efficiencyLoss = Math.max(0, (temp - 25) * 0.004); // 0.4% per degree above 25°C
  const pr = 0.75 * (1 - efficiencyLoss); // Standard performance ratio for India is 0.7-0.8
  const dailyYield = kw * irradiance * pr;
  return {
    dailyKwh: Number(dailyYield.toFixed(2)),
    annualKwh: Math.round(dailyYield * 365),
    efficiency: Number((pr * 100).toFixed(1))
  };
}
