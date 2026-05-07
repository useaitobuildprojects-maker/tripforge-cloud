import { useEffect, useRef, useState } from 'react';
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
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(640);
  const apiKey = (import.meta as any).env.VITE_GOOGLE_MAPS_KEY as string | undefined;

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.max(320, Math.round(e.contentRect.width)));
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  if (!apiKey || (!origin && !destination)) {
    return (
      <div ref={ref} className={className} style={{ height, background: 'linear-gradient(135deg,#eef2f7,#e2e8f0)', borderRadius: 6 }}>
        <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm font-medium gap-2">
          <MapPin className="h-4 w-4" /> Route preview
        </div>
      </div>
    );
  }

  const params = new URLSearchParams();
  params.set('size', `${Math.min(w, 640)}x${Math.min(height, 400)}`);
  params.set('scale', '2');
  params.set('maptype', 'roadmap');
  params.set('key', apiKey);
  if (origin) params.append('markers', `color:0x2563eb|label:A|${origin}`);
  if (destination) params.append('markers', `color:0xdc2626|label:B|${destination}`);
  if (origin && destination) {
    params.append('path', `color:0x1e293bcc|weight:4|geodesic:true|${origin}|${destination}`);
  }

  const url = `https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`;

  return (
    <div ref={ref} className={className} style={{ height, borderRadius: 6, overflow: 'hidden' }}>
      <img src={url} alt="Route preview" className="h-full w-full object-cover" />
    </div>
  );
};

export default RouteMap;