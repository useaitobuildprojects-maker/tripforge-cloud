import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps';
import { formatDistanceToNow } from 'date-fns';
import { Car, MapPin, Phone, Circle } from 'lucide-react';
import { Agency } from '@/types/agency';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAgencyDrivers } from '@/hooks/use-drivers';
import { supabase } from '@/integrations/supabase/client';

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY as string;

const statusColor: Record<string, string> = {
  available: '#10b981',
  on_trip: '#3b82f6',
  offline: '#94a3b8',
};

const AgencyAdminLiveMap = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();
  const { data: drivers = [], isLoading } = useAgencyDrivers(agency.id);
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Realtime: refresh on driver location/status changes
  useEffect(() => {
    const channel = supabase
      .channel(`live-drivers-${agency.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'drivers', filter: `agency_id=eq.${agency.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['drivers', agency.id] });
      })
      .subscribe();
    // Poll every 10s as fallback
    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['drivers', agency.id] });
    }, 10000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [agency.id, queryClient]);

  const located = drivers.filter((d) => d.current_lat != null && d.current_lng != null);
  const center = useMemo(() => {
    if (located.length === 0) return { lat: 41.0082, lng: 28.9784 }; // Istanbul fallback
    const lat = located.reduce((s, d) => s + (d.current_lat ?? 0), 0) / located.length;
    const lng = located.reduce((s, d) => s + (d.current_lng ?? 0), 0) / located.length;
    return { lat, lng };
  }, [located]);

  const selected = drivers.find((d) => d.id === selectedId);

  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Operations</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Live Driver Map</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">Real-time location of every driver currently signed in.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <Card className="overflow-hidden h-[640px]">
          {!GOOGLE_KEY ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">Google Maps key missing.</div>
          ) : (
            <APIProvider apiKey={GOOGLE_KEY}>
              <Map
                defaultCenter={center}
                defaultZoom={located.length ? 11 : 5}
                mapId="driver-live-map"
                gestureHandling="greedy"
                disableDefaultUI={false}
                style={{ width: '100%', height: '100%' }}
              >
                {located.map((d) => (
                  <AdvancedMarker
                    key={d.id}
                    position={{ lat: d.current_lat!, lng: d.current_lng! }}
                    onClick={() => setSelectedId(d.id)}
                  >
                    <div
                      className="w-9 h-9 rounded-full border-2 border-white shadow-lg flex items-center justify-center"
                      style={{ background: statusColor[d.status] ?? '#94a3b8' }}
                    >
                      <Car className="w-4 h-4 text-white" />
                    </div>
                  </AdvancedMarker>
                ))}
                {selected?.current_lat != null && selected?.current_lng != null && (
                  <InfoWindow position={{ lat: selected.current_lat, lng: selected.current_lng }} onCloseClick={() => setSelectedId(null)}>
                    <div className="text-xs space-y-1 min-w-[160px]">
                      <p className="font-semibold text-sm">{selected.full_name}</p>
                      <p className="capitalize text-muted-foreground">{selected.status.replace('_', ' ')}</p>
                      {selected.phone && <p>📞 {selected.phone}</p>}
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          )}
        </Card>

        <Card className="p-4 space-y-3 max-h-[640px] overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-bold">Drivers</h3>
            <Badge variant="outline">{drivers.length}</Badge>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No drivers yet.</p>
          ) : (
            <div className="space-y-2">
              {drivers.map((d) => {
                const hasLoc = d.current_lat != null && d.current_lng != null;
                return (
                  <button
                    key={d.id}
                    onClick={() => hasLoc && setSelectedId(d.id)}
                    className={`w-full text-left p-3 rounded-md border transition ${selectedId === d.id ? 'border-accent bg-accent/5' : 'border-border hover:bg-muted/50'} ${!hasLoc ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm truncate">{d.full_name}</p>
                      <Circle className="w-2 h-2 shrink-0" fill={statusColor[d.status] ?? '#94a3b8'} stroke="none" />
                    </div>
                    <p className="text-xs text-muted-foreground capitalize mt-0.5">{d.status.replace('_', ' ')}</p>
                    {hasLoc ? (
                      <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {d.current_lat!.toFixed(4)}, {d.current_lng!.toFixed(4)}
                      </p>
                    ) : (
                      <p className="text-[10px] text-muted-foreground mt-1">No location yet</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AgencyAdminLiveMap;