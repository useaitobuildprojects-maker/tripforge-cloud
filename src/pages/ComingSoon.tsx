import { Construction } from 'lucide-react';

const ComingSoon = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
      <Construction className="h-8 w-8 text-primary" />
    </div>
    <h1 className="text-xl font-bold text-foreground">{title}</h1>
    <p className="text-sm text-muted-foreground mt-2">This section is coming soon</p>
  </div>
);

export default ComingSoon;
