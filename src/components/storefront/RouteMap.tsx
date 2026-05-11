import { MapPin } from 'lucide-react';

interface Props {
  origin?: string;
  destination?: string;
  className?: string;
  height?: number;
}

/**
 * Lightweight Google Static Maps preview for a route.
 * Falls back to a placeholder when key/coords aren't available.
 */
const RouteMap = ({ origin, destination, className, height = 280 }: Props) => {
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_KEY as string | undefined;

  if (!apiKey || !origin || !destination) {
    return (
      <div className={className} style={{ height, background: 'linear-gradient(135deg,#eef2f7,#e2e8f0)', borderRadius: 6 }}>
        <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm font-medium gap-2">
          <MapPin className="h-4 w-4" /> Route preview
        </div>
      </div>
    );
  }

  const src = `https://www.google.com/maps/embed/v1/directions?key=${apiKey}&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving`;

  return (
    <div className={className} style={{ height, borderRadius: 6, overflow: 'hidden' }}>
      <iframe
        title="Route map"
        src={src}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        style={{ border: 0, width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default RouteMap;