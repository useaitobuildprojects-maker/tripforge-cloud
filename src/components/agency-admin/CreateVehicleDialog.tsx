import { useState } from 'react';
import { Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { useCreateVehicle, useUploadVehiclePhoto } from '@/hooks/use-vehicle-mutations';

interface Props {
  agencyId: string;
}

const CreateVehicleDialog = ({ agencyId }: Props) => {
  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [plate, setPlate] = useState('');
  const [vin, setVin] = useState('');
  const [status, setStatus] = useState<string>('available');
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const createVehicle = useCreateVehicle();
  const uploadPhoto = useUploadVehiclePhoto();

  const reset = () => {
    setBrand(''); setModel(''); setYear(new Date().getFullYear().toString());
    setPlate(''); setVin(''); setStatus('available'); setPhotoFile(null);
  };

  const handleSubmit = async () => {
    if (!brand.trim() || !model.trim()) return;

    let photo_url: string | undefined;
    if (photoFile) {
      photo_url = await uploadPhoto.mutateAsync({ file: photoFile, agencyId });
    }

    await createVehicle.mutateAsync({
      agency_id: agencyId,
      brand: brand.trim(),
      model: model.trim(),
      year: parseInt(year),
      license_plate: plate.trim() || undefined,
      vin: vin.trim() || undefined,
      status,
      photo_url,
    });

    reset();
    setOpen(false);
  };

  const isPending = createVehicle.isPending || uploadPhoto.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Vehicle</DialogTitle>
          <DialogDescription>Add a vehicle to your fleet.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Mercedes" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="model">Model *</Label>
              <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="S-Class" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="year">Year</Label>
              <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="plate">License Plate</Label>
            <Input id="plate" value={plate} onChange={(e) => setPlate(e.target.value)} placeholder="AB-123-CD" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="vin">VIN</Label>
            <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} placeholder="WDB1234567890" />
          </div>

          <div className="space-y-1.5">
            <Label>Photo</Label>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-border p-4 hover:border-accent/40 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {photoFile ? photoFile.name : 'Click to upload a photo'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !brand.trim() || !model.trim()}>
            {isPending ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateVehicleDialog;
