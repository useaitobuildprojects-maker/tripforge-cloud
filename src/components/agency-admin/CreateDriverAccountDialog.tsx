import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KeyRound } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  driverId: string;
  driverName: string;
  driverEmail: string | null;
  agencyId: string;
}

const CreateDriverAccountDialog = ({ open, onOpenChange, driverId, driverName, driverEmail, agencyId }: Props) => {
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const { error } = await supabase.rpc('create_driver_user' as never, {
      p_driver_id: driverId,
      p_password: password,
    } as never);
    setSubmitting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success('Driver account created');
    queryClient.invalidateQueries({ queryKey: ['drivers', agencyId] });
    setPassword('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <KeyRound className="w-4 h-4" /> Create login account
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground">{driverName}</p>
            <p>{driverEmail ?? 'No email set — edit driver first.'}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="dpw">Set password (min 6 chars)</Label>
            <Input id="dpw" type="text" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="e.g. Welcome123" />
            <p className="text-xs text-muted-foreground">Share this with the driver. They sign in at <code>/driver/login</code>.</p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting || !driverEmail}>
              {submitting ? 'Creating…' : 'Create account'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDriverAccountDialog;