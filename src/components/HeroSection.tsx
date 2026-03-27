import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Upload } from 'lucide-react';
import ParticleField from './ParticleField';
import TypewriterText from './TypewriterText';
import SolarLogo from './SolarLogo';

const mockAddresses = [
  "Prestige Lakeside Habitat, Whitefield, Bengaluru - 560066",
  "DLF Phase 5, Sector 43, Gurugram - 122003",
  "Hiranandani Gardens, Powai, Mumbai - 400076",
  "Adyar, Chennai - 600020",
  "Salt Lake City, Sector V, Kolkata - 700091",
  "Banjara Hills, Road No. 12, Hyderabad - 500034",
  "Aundh, Pune - 411007",
  "Gomti Nagar, Lucknow - 226010",
];

interface HeroSectionProps {
  onAddressConfirm: (address: string) => void;
}

export default function HeroSection({ onAddressConfirm }: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = mockAddresses.filter(a =>
    a.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (address: string) => {
    setQuery(address);
    setShowSuggestions(false);
    onAddressConfirm(address);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay" />

      {/* Particle field */}
      <ParticleField />

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="flex justify-center mb-8"
        >
          <SolarLogo size={72} />
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-7xl font-extrabold mb-4 leading-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="text-gradient-primary">
            <TypewriterText texts={["See your roof.", "Own your energy.", "Go solar today."]} />
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-solar-muted mb-10 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          AI + AR solar planning for every Indian home.
        </motion.p>

        {/* Search bar */}
        <motion.div
          className="relative max-w-xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <div className="relative glass rounded-2xl animate-pulse-glow">
            <div className="flex items-center px-5 py-4">
              <Search size={20} className="text-solar-green mr-3 flex-shrink-0" />
              <input
                type="text"
                placeholder="Enter your address or pincode..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                className="flex-1 bg-transparent text-solar-text placeholder:text-solar-muted outline-none text-base"
              />
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(() => {
                      handleSelect("Current Location — Bengaluru, Karnataka");
                    });
                  }
                }}
                className="flex items-center gap-1 text-solar-green text-sm hover:underline ml-3 flex-shrink-0"
              >
                <MapPin size={14} />
                Locate
              </button>
            </div>
          </div>

          {/* Suggestions */}
          {showSuggestions && query.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full mt-2 w-full glass rounded-xl overflow-hidden z-20"
            >
              {filtered.map((addr, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(addr)}
                  className="w-full text-left px-5 py-3 text-sm text-solar-text hover:bg-solar-green/10 transition-colors flex items-center gap-3 border-b border-border/30 last:border-0"
                >
                  <MapPin size={14} className="text-solar-green flex-shrink-0" />
                  {addr}
                </button>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Upload CTA */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-6 inline-flex items-center gap-2 text-solar-muted hover:text-solar-green transition-colors text-sm"
        >
          <Upload size={16} />
          Or upload a roof photo
        </motion.button>
      </div>
    </section>
  );
}
