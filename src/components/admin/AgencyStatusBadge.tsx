import { cn } from '@/lib/utils';

type Status = 'active' | 'inactive' | 'pending';

const statusStyles: Record<Status, string> = {
  active: 'bg-success/15 text-success border-success/20',
  inactive: 'bg-muted text-muted-foreground border-border',
  pending: 'bg-warning/15 text-warning border-warning/20',
};

const AgencyStatusBadge = ({ status }: { status: Status }) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize',
      statusStyles[status]
    )}
  >
    {status}
  </span>
);

export default AgencyStatusBadge;
