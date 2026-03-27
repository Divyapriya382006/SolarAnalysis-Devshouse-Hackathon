import { useMemo } from 'react';

interface GoogleMapPreviewProps {
  address: string;
  className?: string;
}

export default function GoogleMapPreview({ address, className = '' }: GoogleMapPreviewProps) {
  const mapSrc = useMemo(() => {
    const q = encodeURIComponent(address);
    // Use OpenStreetMap embed (no API key required)
    // Extract a rough coordinate from common Indian cities for better centering
    const cityCoords: Record<string, { lat: number; lng: number }> = {
      'bengaluru': { lat: 12.9716, lng: 77.5946 },
      'bangalore': { lat: 12.9716, lng: 77.5946 },
      'mumbai': { lat: 19.0760, lng: 72.8777 },
      'delhi': { lat: 28.7041, lng: 77.1025 },
      'chennai': { lat: 13.0827, lng: 80.2707 },
      'hyderabad': { lat: 17.3850, lng: 78.4867 },
      'kolkata': { lat: 22.5726, lng: 88.3639 },
      'pune': { lat: 18.5204, lng: 73.8567 },
      'gurugram': { lat: 28.4595, lng: 77.0266 },
      'lucknow': { lat: 26.8467, lng: 80.9462 },
      'ahmedabad': { lat: 23.0225, lng: 72.5714 },
      'jaipur': { lat: 26.9124, lng: 75.7873 },
      'whitefield': { lat: 12.9698, lng: 77.7500 },
      'powai': { lat: 19.1176, lng: 72.9060 },
      'adyar': { lat: 13.0067, lng: 80.2571 },
      'salt lake': { lat: 22.5800, lng: 88.4150 },
      'banjara hills': { lat: 17.4156, lng: 78.4347 },
      'aundh': { lat: 18.5580, lng: 73.8077 },
      'gomti nagar': { lat: 26.8563, lng: 80.9920 },
    };

    const addressLower = address.toLowerCase();
    let lat = 20.5937, lng = 78.9629, zoom = 17; // Default India center

    for (const [key, coords] of Object.entries(cityCoords)) {
      if (addressLower.includes(key)) {
        lat = coords.lat;
        lng = coords.lng;
        break;
      }
    }

    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [address]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <iframe
        src={mapSrc}
        className="w-full h-full border-0"
        style={{ filter: 'saturate(0.6) brightness(0.7) hue-rotate(180deg)', minHeight: '200px' }}
        loading="lazy"
        title="Location Map"
      />
      {/* Dark overlay for matching theme */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(135deg, rgba(10,15,30,0.3), rgba(10,15,30,0.1))',
        mixBlendMode: 'multiply',
      }} />
      {/* Location pin label */}
      <div className="absolute bottom-3 left-3 glass rounded-lg px-3 py-1.5 text-xs text-solar-green flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-solar-green animate-pulse" />
        Satellite View
      </div>
    </div>
  );
}
