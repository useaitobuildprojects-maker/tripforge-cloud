import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateVehicle } from '@/hooks/use-vehicle-mutations';
import { Vehicle } from '@/hooks/use-vehicles';

interface EditVehicleDialogProps {
  vehicle: Vehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditVehicleDialog = ({ vehicle, open, onOpenChange }: EditVehicleDialogProps) => {
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [status, setStatus] = useState<'available' | 'rented' | 'maintenance'>('available');

  const updateVehicle = useUpdateVehicle();

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setLicensePlate(vehicle.license_plate ?? '');
      setVin(vehicle.vin ?? '');
      setStatus(vehicle.status);
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    updateVehicle.mutate(
      {
        id: vehicle.id,
        agency_id: vehicle.agency_id,
        brand,
        model,
        year,
        license_plate: licensePlate || null,
        vin: vin || null,
        status,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle className="font-display">Edit Vehicle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editBrand">Brand</Label>
              <Input id="editBrand" value={brand} onChange={(e) => setBrand(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editModel">Model</Label>
              <Input id="editModel" value={model} onChange={(e) => setModel(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editYear">Year</Label>
              <Input id="editYear" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} required />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'available' | 'rented' | 'maintenance')}>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editPlate">License Plate</Label>
              <Input id="editPlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editVin">VIN</Label>
              <Input id="editVin" value={vin} onChange={(e) => setVin(e.target.value)} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={updateVehicle.isPending}>
              {updateVehicle.isPending ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditVehicleDialog;
