import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Car, LogOut, MapPin, Phone, Mail, Navigation, CheckCircle2, PlayCircle, Loader2, Wifi, WifiOff } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrentDriver } from '@/hooks/use-current-driver';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface DriverBooking {
  id: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  pickup_location: string | null;
  return_location: string | null;
  pickup_date: string;
  return_date: string;
  status: string;
  service_type: string | null;
  amount: number | null;
  notes: string | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  confirmed: 'bg-accent/15 text-accent border-accent/30',
  in_progress: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  completed: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  cancelled: 'bg-destructive/15 text-destructive border-destructive/30',
};

const DriverDashboard = () => {
  const navigate = useNavigate();
  const { user, signOut, loading } = useAuth();
  const { data: driver, isLoading: driverLoading, error: driverError } = useCurrentDriver();
  const queryClient = useQueryClient();
  const [tracking, setTracking] = useState<{ ok: boolean; lastAt?: Date; error?: string }>({ ok: false });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) navigate('/driver/login', { replace: true });
  }, [loading, user, navigate]);

  // GPS tracking — always while open
  useEffect(() => {
    if (!driver) return;
    if (!('geolocation' in navigator)) {
      setTracking({ ok: false, error: 'Geolocation not supported' });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const { error } = await supabase
          .from('drivers')
          .update({
            current_lat: latitude,
            current_lng: longitude,
            current_location_updated_at: new Date().toISOString(),
            status: driver.status === 'offline' ? 'available' : driver.status,
          })
          .eq('id', driver.id);
        if (!error) setTracking({ ok: true, lastAt: new Date() });
      },
      (err) => setTracking({ ok: false, error: err.message }),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [driver]);

  // Set offline on unload
  useEffect(() => {
    if (!driver) return;
    const goOffline = () => {
      navigator.sendBeacon?.(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/drivers?id=eq.${driver.id}`,
        new Blob([JSON.stringify({ status: 'offline' })], { type: 'application/json' })
      );
    };
    window.addEventListener('beforeunload', goOffline);
    return () => window.removeEventListener('beforeunload', goOffline);
  }, [driver]);

  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useQuery({
    queryKey: ['driver-bookings', driver?.id],
    queryFn: async (): Promise<DriverBooking[]> => {
      if (!driver) return [];
      const { data, error } = await supabase
        .from('bookings')
        .select('id, customer_name, customer_phone, customer_email, pickup_location, return_location, pickup_date, return_date, status, service_type, amount, notes')
        .eq('driver_id', driver.id)
        .order('pickup_date', { ascending: true });
      if (error) throw error;
      return (data ?? []) as DriverBooking[];
    },
    enabled: !!driver,
  });

  // Realtime updates
  useEffect(() => {
    if (!driver) return;
    const channel = supabase
      .channel(`driver-bookings-${driver.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `driver_id=eq.${driver.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['driver-bookings', driver.id] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [driver, queryClient]);

  const updateStatus = async (bookingId: string, status: string) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Trip ${status.replace('_', ' ')}`);
    refetch();
  };

  const handleSignOut = async () => {
    if (driver) {
      await supabase.from('drivers').update({ status: 'offline' }).eq('id', driver.id);
    }
    await signOut();
    navigate('/driver/login', { replace: true });
  };

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: bookings.filter((b) => new Date(b.return_date).getTime() >= now && b.status !== 'cancelled' && b.status !== 'completed'),
      past: bookings.filter((b) => new Date(b.return_date).getTime() < now || b.status === 'completed' || b.status === 'cancelled'),
    };
  }, [bookings]);

  if (loading || driverLoading) {
    return (
      <div className="min-h-screen p-6 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (driverError || !driver) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="p-8 max-w-md text-center space-y-4">
          <h1 className="text-xl font-display font-bold">Not a driver account</h1>
          <p className="text-sm text-muted-foreground">
            This account isn't linked to a driver profile. Please ask your agency admin.
          </p>
          <Button variant="outline" onClick={handleSignOut}>Sign out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <Car className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="font-semibold text-sm truncate">{driver.full_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={tracking.ok ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30' : 'bg-muted text-muted-foreground'}>
              {tracking.ok ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {tracking.ok ? 'Live' : 'GPS off'}
            </Badge>
            <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign out">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {!tracking.ok && tracking.error && (
          <Card className="p-4 bg-amber-500/5 border-amber-500/30 text-sm">
            <p className="font-medium text-amber-700 mb-1">Location unavailable</p>
            <p className="text-muted-foreground">{tracking.error} — please allow location access so your agency can track you.</p>
          </Card>
        )}

        <section>
          <h2 className="font-display font-bold text-lg mb-3">Upcoming trips ({upcoming.length})</h2>
          {bookingsLoading ? (
            <Skeleton className="h-40 w-full" />
          ) : upcoming.length === 0 ? (
            <Card className="p-6 text-center text-sm text-muted-foreground">No assigned trips right now.</Card>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => <BookingCard key={b.id} booking={b} onStart={() => updateStatus(b.id, 'in_progress')} onComplete={() => updateStatus(b.id, 'completed')} />)}
            </div>
          )}
        </section>

        {past.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-lg mb-3 text-muted-foreground">Past trips</h2>
            <div className="space-y-3 opacity-75">
              {past.slice(0, 10).map((b) => <BookingCard key={b.id} booking={b} compact />)}
            </div>
          </section>
        )}
      </main>
    </div>
  );

  function BookingCard({ booking, onStart, onComplete, compact }: { booking: DriverBooking; onStart?: () => void; onComplete?: () => void; compact?: boolean }) {
    const mapsUrl = booking.pickup_location
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.pickup_location)}`
      : null;
    const dropoffUrl = booking.return_location
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.return_location)}`
      : null;

    return (
      <Card className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold truncate">{booking.customer_name}</p>
            <p className="text-xs text-muted-foreground capitalize">{booking.service_type?.replace('_', ' ') ?? 'Trip'}</p>
          </div>
          <Badge variant="outline" className={statusColors[booking.status] ?? statusColors.pending}>
            {booking.status.replace('_', ' ')}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-muted-foreground mb-0.5">Pickup</p>
            <p className="font-medium">{format(new Date(booking.pickup_date), 'PP HH:mm')}</p>
            {booking.pickup_location && <p className="text-muted-foreground truncate">{booking.pickup_location}</p>}
          </div>
          <div>
            <p className="text-muted-foreground mb-0.5">Drop-off</p>
            <p className="font-medium">{format(new Date(booking.return_date), 'PP HH:mm')}</p>
            {booking.return_location && <p className="text-muted-foreground truncate">{booking.return_location}</p>}
          </div>
        </div>

        {!compact && (
          <>
            {(booking.customer_phone || booking.customer_email) && (
              <div className="flex flex-wrap gap-2">
                {booking.customer_phone && (
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <a href={`tel:${booking.customer_phone}`}><Phone className="w-3 h-3 mr-1" />{booking.customer_phone}</a>
                  </Button>
                )}
                {booking.customer_email && (
                  <Button asChild size="sm" variant="outline" className="h-8">
                    <a href={`mailto:${booking.customer_email}`}><Mail className="w-3 h-3 mr-1" />Email</a>
                  </Button>
                )}
              </div>
            )}

            {booking.notes && (
              <p className="text-xs bg-muted/50 rounded p-2 text-muted-foreground">{booking.notes}</p>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {mapsUrl && (
                <Button asChild size="sm" variant="outline" className="h-8">
                  <a href={mapsUrl} target="_blank" rel="noreferrer"><Navigation className="w-3 h-3 mr-1" />To pickup</a>
                </Button>
              )}
              {dropoffUrl && (
                <Button asChild size="sm" variant="outline" className="h-8">
                  <a href={dropoffUrl} target="_blank" rel="noreferrer"><MapPin className="w-3 h-3 mr-1" />To drop-off</a>
                </Button>
              )}
              {booking.status !== 'in_progress' && booking.status !== 'completed' && onStart && (
                <Button size="sm" className="h-8" onClick={onStart}>
                  <PlayCircle className="w-3 h-3 mr-1" />Start trip
                </Button>
              )}
              {booking.status === 'in_progress' && onComplete && (
                <Button size="sm" className="h-8 bg-emerald-600 hover:bg-emerald-700" onClick={onComplete}>
                  <CheckCircle2 className="w-3 h-3 mr-1" />Complete
                </Button>
              )}
            </div>
          </>
        )}
      </Card>
    );
  }
};

export default DriverDashboard;