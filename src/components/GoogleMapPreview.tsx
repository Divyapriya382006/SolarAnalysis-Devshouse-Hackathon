import { useMemo } from 'react';

interface GoogleMapPreviewProps {
  address: string;
  lat: number;
  lng: number;
  className?: string;
}

export default function GoogleMapPreview({ address, lat, lng, className = '' }: GoogleMapPreviewProps) {
  const mapSrc = useMemo(() => {
    return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005}%2C${lat - 0.003}%2C${lng + 0.005}%2C${lat + 0.003}&layer=mapnik&marker=${lat}%2C${lng}`;
  }, [lat, lng]);

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
