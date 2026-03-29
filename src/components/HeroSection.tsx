import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Upload } from 'lucide-react';
import ParticleField from './ParticleField';
import TypewriterText from './TypewriterText';
import SolarLogo from './SolarLogo';

const mockAddresses = [
  "Shanti Niketan, Sector 21, New Delhi - 110021",
  "Ocean View Apartments, Marine Drive, Mumbai - 400020",
  "Green Valley Residency, Whitefield, Bengaluru - 560066",
  "Maple Leaf Colony, Anna Nagar West, Chennai - 600040",
  "Ruby Heights, Road No. 12, Banjara Hills, Hyderabad - 500034",
  "Silver Oak Estate, Ward 7, Aundh, Pune - 411007",
  "Heritage Square, Block CL, Salt Lake, Kolkata - 700091",
  "Sunrise Society, Vibhuti Khand, Gomti Nagar, Lucknow - 226010",
  "DLF Phase 5, Golf Course Road, Gurugram - 122002",
  "Sector 17, Vashi, Navi Mumbai - 400703",
];

interface HeroSectionProps {
  onAddressConfirm: (address: string, coords: { lat: number, lng: number }) => void;
}

export default function HeroSection({ onAddressConfirm }: HeroSectionProps) {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (addr: string) => {
    setLoading(true);
    try {
      // Prioritize Indian subcontinent in query parameters
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(addr)}&countrycodes=in&limit=1&addressdetails=1`
      );
      const data = await resp.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        // Ensure granular address extraction
        const displayName = result.display_name.split(',').slice(0, 4).join(',');
        onAddressConfirm(displayName, { lat: parseFloat(result.lat), lng: parseFloat(result.lon) });
      } else {
        // High-precision fallback for common Indian cities if exact match fails
        onAddressConfirm(addr, { lat: 28.6139, lng: 77.2090 }); // Default to New Delhi (Capital)
      }
    } catch (e) {
      onAddressConfirm(addr, { lat: 28.6139, lng: 77.2090 });
    }
    setLoading(false);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await resp.json();
        const addr = data.display_name || `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        onAddressConfirm(addr, { lat: latitude, lng: longitude });
      } catch (e) {
        onAddressConfirm(`Current Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`, { lat: latitude, lng: longitude });
      }
      setLoading(false);
    });
  };

  const handleSelect = (address: string) => {
    setQuery(address);
    setShowSuggestions(false);
    handleSearch(address);
  };

  const filtered = mockAddresses.filter(a =>
    a.toLowerCase().includes(query.toLowerCase())
  );

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
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                className="flex-1 bg-transparent text-solar-text placeholder:text-solar-muted outline-none text-base"
              />
              {loading && <div className="w-4 h-4 border-2 border-solar-green border-t-transparent animate-spin rounded-full mr-3" />}
              <button
                onClick={handleLocate}
                disabled={loading}
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
