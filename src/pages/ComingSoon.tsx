import { Construction } from 'lucide-react';
import { motion } from 'framer-motion';

const ComingSoon = ({ title }: { title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center"
  >
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/8 mb-5">
      <Construction className="h-8 w-8 text-accent" />
    </div>
    <h1 className="text-2xl font-display font-bold text-foreground">{title}</h1>
    <p className="text-sm text-muted-foreground mt-2 font-light">
      This section is currently under development
    </p>
    <div className="gold-line w-16 mt-5 mx-auto opacity-60" />
  </motion.div>
);

export default ComingSoon;
