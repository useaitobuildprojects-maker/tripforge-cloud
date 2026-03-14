import { motion } from 'framer-motion';
import { CalendarDays, Info } from 'lucide-react';

const Bookings = () => {
  return (
    <div className="space-y-8 max-w-[1200px]">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="text-[11px] font-semibold text-accent uppercase tracking-[0.2em] mb-1">Management</p>
        <h1 className="text-[30px] font-display font-bold text-foreground leading-tight">Bookings</h1>
        <p className="text-sm text-muted-foreground mt-1.5 font-light">View and manage all bookings across agencies</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card-premium rounded-xl p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
            <CalendarDays className="h-8 w-8 text-accent" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Bookings Table Needed</h2>
          <div className="flex items-start gap-2 max-w-md text-left bg-secondary/40 rounded-xl p-4">
            <Info className="h-4 w-4 text-accent mt-0.5 shrink-0" />
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              A <strong>bookings</strong> table needs to be created in your database to enable this feature. 
              The table should include fields like: <code className="text-accent text-xs">agency_id</code>, <code className="text-accent text-xs">customer_name</code>, <code className="text-accent text-xs">service_type</code>, <code className="text-accent text-xs">status</code>, <code className="text-accent text-xs">amount</code>, and <code className="text-accent text-xs">booking_date</code>.
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Ask me to create the bookings table and I'll set it up for you!</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Bookings;
