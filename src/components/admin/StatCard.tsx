import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  index?: number;
}

const StatCard = ({ title, value, change, icon: Icon, iconColor, index = 0 }: StatCardProps) => {
  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="bg-card rounded-lg p-6 card-premium group hover:shadow-lg hover:border-accent/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
            {title}
          </p>
          <p className="text-[28px] font-display font-bold text-foreground leading-none">{value}</p>
        </div>
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg",
          iconColor || "bg-accent/10"
        )}>
          <Icon className="h-5 w-5 text-accent" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-4 flex items-center gap-2 pt-3 border-t border-border/60">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5",
            isPositive ? "bg-success/10" : "bg-destructive/10"
          )}>
            {isPositive ? (
              <TrendingUp className="h-3 w-3 text-success" />
            ) : (
              <TrendingDown className="h-3 w-3 text-destructive" />
            )}
            <span className={cn(
              'text-[11px] font-bold',
              isPositive ? 'text-success' : 'text-destructive'
            )}>
              {isPositive ? '+' : ''}{change}%
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
