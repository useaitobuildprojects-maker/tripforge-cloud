import { useMemo, useState } from 'react';
import { addDays, differenceInCalendarDays, format, isSameDay, isWeekend, parseISO, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarRange, CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export interface TimelineRow {
  id: string;
  title: string;
  subtitle?: string;
}

export interface TimelineReservation {
  id: string;
  customer_name: string;
  pickup_date: string;
  return_date: string;
  status: string;
  resource_id: string;
}

interface Props {
  rows: TimelineRow[];
  reservations: TimelineReservation[];
  title?: string;
  emptyLabel?: string;
}

const DAY_W = 56; // px per day column
const ROW_H = 44;
const LABEL_W = 180;
const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
];

const statusColor: Record<string, string> = {
  confirmed: 'bg-accent/30 border-accent/60 text-accent-foreground',
  pending: 'bg-amber-200/40 border-amber-400/60 text-amber-900 dark:text-amber-100',
  completed: 'bg-emerald-200/40 border-emerald-400/60 text-emerald-900 dark:text-emerald-100',
  cancelled: 'bg-muted border-border text-muted-foreground line-through',
};

const FleetReservationTimeline = ({ rows, reservations, title = 'Reservations Calendar', emptyLabel = 'No items to display.' }: Props) => {
  const [anchor, setAnchor] = useState<Date>(() => startOfDay(new Date()));
  const [visibleDays, setVisibleDays] = useState<number>(14);
  const [pickerOpen, setPickerOpen] = useState(false);

  const days = useMemo(
    () => Array.from({ length: visibleDays }, (_, i) => addDays(anchor, i)),
    [anchor, visibleDays]
  );
  const windowStart = days[0];
  const windowEnd = days[days.length - 1];

  const reservationsByResource = useMemo(() => {
    const map = new Map<string, TimelineReservation[]>();
    for (const r of reservations) map.set(r.resource_id, [...(map.get(r.resource_id) ?? []), r]);
    return map;
  }, [reservations]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-accent" />
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          <Select value={String(visibleDays)} onValueChange={(v) => setVisibleDays(Number(v))}>
            <SelectTrigger className="h-8 w-[110px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={String(o.value)} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => setAnchor((d) => addDays(d, -visibleDays))} title="Previous">
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 px-3 text-xs gap-1.5 min-w-[200px] justify-start font-normal">
                <CalendarIcon className="h-3.5 w-3.5" />
                {format(windowStart, 'MMM d')} — {format(windowEnd, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={anchor}
                onSelect={(d) => { if (d) { setAnchor(startOfDay(d)); setPickerOpen(false); } }}
                initialFocus
                className={cn('p-3 pointer-events-auto')}
              />
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm" className="h-8 px-3 text-xs" onClick={() => setAnchor(startOfDay(new Date()))}>
            Today
          </Button>
          <Button variant="outline" size="sm" className="h-8 px-2" onClick={() => setAnchor((d) => addDays(d, visibleDays))} title="Next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="border border-border rounded-md overflow-x-auto">
        <div style={{ minWidth: LABEL_W + DAY_W * visibleDays }}>
          {/* Header row */}
          <div className="flex sticky top-0 z-10 bg-card border-b border-border">
            <div
              className="shrink-0 flex items-end justify-start px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-r border-border"
              style={{ width: LABEL_W }}
            >
              {format(anchor, 'yyyy')}
            </div>
            {days.map((d) => {
              const today = isSameDay(d, new Date());
              return (
                <div
                  key={d.toISOString()}
                  className={cn(
                    'shrink-0 flex flex-col items-center justify-center py-2 border-r border-border text-[11px]',
                    isWeekend(d) && 'bg-muted/30',
                    today && 'bg-accent/10'
                  )}
                  style={{ width: DAY_W }}
                >
                  <span className={cn('font-semibold tabular-nums', today && 'text-accent')}>{format(d, 'dd.MM')}</span>
                  <span className="text-muted-foreground">{format(d, 'EEE')}</span>
                </div>
              );
            })}
          </div>

          {/* Vehicle rows */}
          {rows.length === 0 ? (
            <div className="px-4 py-6 text-sm text-muted-foreground text-center">{emptyLabel}</div>
          ) : (
            rows.map((v) => {
              const vRes = reservationsByResource.get(v.id) ?? [];
              return (
                <div key={v.id} className="flex border-b border-border last:border-b-0 relative" style={{ height: ROW_H }}>
                  <div
                    className="shrink-0 flex flex-col justify-center px-3 border-r border-border bg-secondary/20"
                    style={{ width: LABEL_W }}
                  >
                    <p className="text-xs font-semibold text-foreground truncate leading-tight">
                      {v.title}
                    </p>
                    {v.subtitle && (
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {v.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Day grid background */}
                  <div className="flex relative" style={{ width: DAY_W * visibleDays }}>
                    {days.map((d) => (
                      <div
                        key={d.toISOString()}
                        className={cn(
                          'shrink-0 border-r border-border/60 h-full',
                          isWeekend(d) && 'bg-muted/20',
                          isSameDay(d, new Date()) && 'bg-accent/5'
                        )}
                        style={{ width: DAY_W }}
                      />
                    ))}

                    {/* Reservation bars */}
                    {vRes.map((r) => {
                      let start: Date, end: Date, startRaw: Date, endRaw: Date;
                      try {
                        startRaw = parseISO(r.pickup_date);
                        endRaw = parseISO(r.return_date);
                        start = startOfDay(startRaw);
                        end = startOfDay(endRaw);
                      } catch { return null; }
                      if (end < windowStart || start > windowEnd) return null;
                      const clampedStart = start < windowStart ? windowStart : start;
                      const clampedEnd = end > windowEnd ? windowEnd : end;
                      const offset = differenceInCalendarDays(clampedStart, windowStart);
                      const span = differenceInCalendarDays(clampedEnd, clampedStart) + 1;
                      const left = offset * DAY_W + 4;
                      const width = span * DAY_W - 8;
                      const color = statusColor[r.status] ?? statusColor.confirmed;
                      const pickupTime = format(startRaw, 'HH:mm');
                      const returnTime = format(endRaw, 'HH:mm');
                      return (
                        <div
                          key={r.id}
                          title={`${r.customer_name}\nPickup: ${format(startRaw, 'MMM d, yyyy HH:mm')}\nReturn: ${format(endRaw, 'MMM d, yyyy HH:mm')}\nStatus: ${r.status}`}
                          className={cn(
                            'absolute top-1.5 bottom-1.5 rounded-md border pl-1.5 pr-1.5 flex items-center justify-between gap-1.5 text-[11px] font-medium overflow-hidden whitespace-nowrap shadow-sm',
                            color
                          )}
                          style={{ left, width: Math.max(width, 24) }}
                        >
                          <span className="font-mono text-[10px] opacity-75 tabular-nums shrink-0">{pickupTime}</span>
                          <span className="truncate flex-1 text-center">{r.customer_name}</span>
                          <span className="font-mono text-[10px] opacity-75 tabular-nums shrink-0">{returnTime}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-accent/30 border border-accent/60" /> Confirmed</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-amber-200/40 border border-amber-400/60" /> Pending</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-emerald-200/40 border border-emerald-400/60" /> Completed</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-3 w-4 rounded-sm bg-muted border border-border" /> Cancelled</span>
      </div>
    </div>
  );
};

export default FleetReservationTimeline;