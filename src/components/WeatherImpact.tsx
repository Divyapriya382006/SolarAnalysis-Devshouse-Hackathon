import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from './GlassCard';
import { Sun, Cloud, CloudRain, Thermometer, X } from 'lucide-react';

const cities = [
  { name: 'Delhi', lat: 28.6 }, { name: 'Mumbai', lat: 19.1 }, { name: 'Bengaluru', lat: 12.9 },
  { name: 'Chennai', lat: 13.1 }, { name: 'Hyderabad', lat: 17.4 }, { name: 'Kolkata', lat: 22.6 },
  { name: 'Pune', lat: 18.5 }, { name: 'Ahmedabad', lat: 23.0 }, { name: 'Jaipur', lat: 26.9 },
  { name: 'Lucknow', lat: 26.8 },
];

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthData(lat: number) {
  return monthNames.map((month, i) => {
    const baseIrradiance = 4.5 + Math.sin(((i - 2) / 12) * Math.PI * 2) * 1.5;
    const latFactor = 1 - Math.abs(lat - 15) * 0.01;
    const monsoonDip = (i >= 5 && i <= 8) ? 0.7 : 1;
    const irradiance = Math.round(baseIrradiance * latFactor * monsoonDip * 100) / 100;
    const temp = Math.round(25 + Math.sin(((i - 1) / 12) * Math.PI * 2) * 10 + (lat < 20 ? 3 : 0));
    const rain = i >= 5 && i <= 9 ? Math.round(40 + Math.random() * 40) : Math.round(5 + Math.random() * 15);
    const gen = Math.round(irradiance * 30 * 3 * (1 - Math.max(0, temp - 25) * 0.004));
    const weather: 'sun' | 'cloud' | 'rain' = rain > 30 ? 'rain' : rain > 15 ? 'cloud' : 'sun';
    return { month, irradiance, temp, rain, gen, weather };
  });
}

export default function WeatherImpact() {
  const [selectedCity, setSelectedCity] = useState(cities[2]);
  const [expandedMonth, setExpandedMonth] = useState<number | null>(null);

  const data = getMonthData(selectedCity.lat);

  const WeatherIcon = ({ type, size = 20 }: { type: string; size?: number }) => {
    switch (type) {
      case 'rain': return <CloudRain size={size} className="text-solar-indigo" />;
      case 'cloud': return <Cloud size={size} className="text-solar-muted" />;
      default: return <Sun size={size} className="text-solar-amber" />;
    }
  };

  return (
    <section id="weather" className="min-h-screen py-20 px-6 lg:pl-24">
      <motion.h2
        className="text-4xl sm:text-5xl font-bold mb-4 text-gradient-amber"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        Weather Impact
      </motion.h2>
      <motion.p
        className="text-solar-muted mb-8 max-w-2xl"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
      >
        Month-by-month solar irradiance and generation forecast for your location.
      </motion.p>

      {/* City selector */}
      <div className="flex flex-wrap gap-2 mb-10">
        {cities.map((city) => (
          <button
            key={city.name}
            onClick={() => setSelectedCity(city)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              selectedCity.name === city.name
                ? 'bg-solar-green text-solar-navy font-semibold'
                : 'glass text-solar-muted hover:text-solar-text'
            }`}
          >
            {city.name}
          </button>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {data.map((m, i) => (
          <motion.div
            key={`${selectedCity.name}-${i}`}
            initial={{ opacity: 0, rotateY: 90 }}
            whileInView={{ opacity: 1, rotateY: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, duration: 0.5 }}
            style={{ perspective: '1000px' }}
          >
            <GlassCard
              className="cursor-pointer text-center"
              delay={0}
              hover={true}
            >
              <button onClick={() => setExpandedMonth(i)} className="w-full">
                <WeatherIcon type={m.weather} />
                <div className="text-sm font-semibold mt-2">{m.month}</div>
                <div className="font-mono-data text-lg text-solar-amber mt-1">{m.irradiance}</div>
                <div className="text-[10px] text-solar-muted">kWh/m²/day</div>
                <div className="font-mono-data text-sm text-solar-green mt-2">{m.gen} kWh</div>
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-solar-muted">
                  <Thermometer size={10} />
                  {m.temp}°C
                </div>
              </button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      {/* Expanded month modal */}
      <AnimatePresence>
        {expandedMonth !== null && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-solar-navy/80 backdrop-blur-sm" onClick={() => setExpandedMonth(null)} />
            <motion.div
              layoutId={`month-${expandedMonth}`}
              className="relative glass rounded-2xl p-8 max-w-md w-full z-10"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              <button onClick={() => setExpandedMonth(null)} className="absolute top-4 right-4 text-solar-muted hover:text-solar-text">
                <X size={20} />
              </button>
              <WeatherIcon type={data[expandedMonth].weather} size={40} />
              <h3 className="text-2xl font-bold mt-4">{data[expandedMonth].month} — {selectedCity.name}</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <div className="text-xs text-solar-muted uppercase tracking-wider">Irradiance</div>
                  <div className="font-mono-data text-2xl text-solar-amber">{data[expandedMonth].irradiance} <span className="text-sm">kWh/m²</span></div>
                </div>
                <div>
                  <div className="text-xs text-solar-muted uppercase tracking-wider">Generation</div>
                  <div className="font-mono-data text-2xl text-solar-green">{data[expandedMonth].gen} <span className="text-sm">kWh</span></div>
                </div>
                <div>
                  <div className="text-xs text-solar-muted uppercase tracking-wider">Temperature</div>
                  <div className="font-mono-data text-2xl text-solar-text">{data[expandedMonth].temp}°C</div>
                </div>
                <div>
                  <div className="text-xs text-solar-muted uppercase tracking-wider">Rain Probability</div>
                  <div className="font-mono-data text-2xl text-solar-indigo">{data[expandedMonth].rain}%</div>
                </div>
              </div>
              <div className="mt-4 text-xs text-solar-muted">
                Efficiency drop: -{((data[expandedMonth].temp - 25) * 0.4).toFixed(1)}% (temp above 25°C)
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
