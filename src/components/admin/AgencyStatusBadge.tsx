import { cn } from '@/lib/utils';

type Status = 'active' | 'inactive' | 'pending';

const statusConfig: Record<Status, { bg: string; dot: string; text: string; label: string }> = {
  active: {
    bg: 'bg-success/8',
    dot: 'bg-success',
    text: 'text-success',
    label: 'Active',
  },
  inactive: {
    bg: 'bg-muted',
    dot: 'bg-muted-foreground',
    text: 'text-muted-foreground',
    label: 'Inactive',
  },
  pending: {
    bg: 'bg-accent/8',
    dot: 'bg-accent',
    text: 'text-accent',
    label: 'Pending',
  },
};

const AgencyStatusBadge = ({ status }: { status: Status }) => {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        config.bg,
        config.text
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
};

export default AgencyStatusBadge;
