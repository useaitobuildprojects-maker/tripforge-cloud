import { cn } from '@/lib/utils';

type Status = 'active' | 'inactive' | 'pending';

const statusConfig: Record<Status, { bg: string; dot: string; text: string }> = {
  active: {
    bg: 'bg-success/10',
    dot: 'bg-success',
    text: 'text-success',
  },
  inactive: {
    bg: 'bg-muted',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
  },
  pending: {
    bg: 'bg-warning/10',
    dot: 'bg-warning',
    text: 'text-warning',
  },
};

const AgencyStatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize',
        config.bg,
        config.text
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {status}
    </span>
  );
};

export default AgencyStatusBadge;
