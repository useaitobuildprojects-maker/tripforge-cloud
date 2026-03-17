import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useCreateDriver } from '@/hooks/use-driver-mutations';

const CreateDriverDialog = ({ agencyId }: { agencyId: string }) => {
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [baseLocation, setBaseLocation] = useState('');
  const [status, setStatus] = useState<'available' | 'on_trip' | 'offline'>('available');

  const createDriver = useCreateDriver();

  const resetForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setBaseLocation('');
    setStatus('available');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDriver.mutate(
      {
        agency_id: agencyId,
        full_name: fullName,
        phone: phone || undefined,
        email: email || undefined,
        base_location: baseLocation || undefined,
        status,
      },
      {
        onSuccess: () => {
          resetForm();
          setOpen(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Driver
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">Add New Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="driverName">Full Name</Label>
            <Input id="driverName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ahmed Ben Ali" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="driverPhone">Phone</Label>
              <Input id="driverPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 6XX XXX XXX" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="driverEmail">Email</Label>
              <Input id="driverEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="driver@email.com" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="baseLocation">Base Location</Label>
            <Input id="baseLocation" value={baseLocation} onChange={(e) => setBaseLocation(e.target.value)} placeholder="e.g. Marrakech, Gueliz" />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createDriver.isPending}>
              {createDriver.isPending ? 'Adding…' : 'Add Driver'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDriverDialog;
