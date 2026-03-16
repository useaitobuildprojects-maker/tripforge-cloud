import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateDriver } from '@/hooks/use-driver-mutations';
import { Driver } from '@/hooks/use-drivers';

interface EditDriverDialogProps {
  driver: Driver | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDriverDialog = ({ driver, open, onOpenChange }: EditDriverDialogProps) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [status, setStatus] = useState<'available' | 'busy' | 'offline'>('available');

  const updateDriver = useUpdateDriver();

  useEffect(() => {
    if (driver) {
      setFullName(driver.full_name);
      setPhone(driver.phone ?? '');
      setEmail(driver.email ?? '');
      setBaseLocation(driver.base_location ?? '');
      setStatus(driver.status);
    }
  }, [driver]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!driver) return;
    updateDriver.mutate(
      {
        id: driver.id,
        agency_id: driver.agency_id,
        full_name: fullName,
        phone: phone || null,
        email: email || null,
        base_location: baseLocation || null,
        status,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="editDriverName">Full Name</Label>
            <Input id="editDriverName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editDriverPhone">Phone</Label>
              <Input id="editDriverPhone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editDriverEmail">Email</Label>
              <Input id="editDriverEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editBaseLocation">Base Location</Label>
            <Input id="editBaseLocation" value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as 'available' | 'busy' | 'offline')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">On Trip</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateDriver.isPending}>
              {updateDriver.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDriverDialog;
