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

const StatCard = ({ title, value, change, icon: Icon, index = 0 }: StatCardProps) => {
  const isPositive = change && change > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
      className="card-premium rounded-xl p-6 group"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em]">
            {title}
          </p>
          <p className="text-[32px] font-display font-bold text-foreground leading-none tracking-tight">
            {value}
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/8 group-hover:bg-accent/12 transition-colors duration-300">
          <Icon className="h-[22px] w-[22px] text-accent" />
        </div>
      </div>
      {change !== undefined && (
        <div className="mt-5 flex items-center gap-2.5 pt-4 border-t border-border/50">
          <div className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1",
            isPositive ? "bg-success/8" : "bg-destructive/8"
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
          <span className="text-[11px] text-muted-foreground font-medium">vs last month</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
