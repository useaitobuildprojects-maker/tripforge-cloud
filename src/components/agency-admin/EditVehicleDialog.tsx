import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  const [transmission, setTransmission] = useState('manual');
  const [seats, setSeats] = useState(5);
  const [fuelType, setFuelType] = useState('gasoline');
  const [category, setCategory] = useState('sedan');
  const [airConditioning, setAirConditioning] = useState(true);
  const [mileagePolicy, setMileagePolicy] = useState('unlimited');
  const [pricePerKm, setPricePerKm] = useState('');

  const updateVehicle = useUpdateVehicle();

  useEffect(() => {
    if (vehicle) {
      setBrand(vehicle.brand);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setLicensePlate(vehicle.license_plate ?? '');
      setVin(vehicle.vin ?? '');
      setStatus(vehicle.status);
      setTransmission((vehicle as any).transmission ?? 'manual');
      setSeats((vehicle as any).seats ?? 5);
      setFuelType((vehicle as any).fuel_type ?? 'gasoline');
      setCategory((vehicle as any).category ?? 'sedan');
      setAirConditioning((vehicle as any).air_conditioning ?? true);
      setMileagePolicy((vehicle as any).mileage_policy ?? 'unlimited');
      setPricePerKm(vehicle.price_per_km != null ? String(vehicle.price_per_km) : '');
    }
  }, [vehicle]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle) return;
    const kmPrice = parseFloat(pricePerKm);
    updateVehicle.mutate(
      {
        id: vehicle.id,
        agency_id: vehicle.agency_id,
        brand, model, year,
        license_plate: licensePlate || null,
        vin: vin || null,
        status, transmission, seats,
        fuel_type: fuelType, category,
        air_conditioning: airConditioning,
        mileage_policy: mileagePolicy,
        price_per_km: kmPrice > 0 ? kmPrice : null,
      },
      { onSuccess: () => onOpenChange(false) }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
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
              <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedan">Sedan</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                  <SelectItem value="hatchback">Hatchback</SelectItem>
                  <SelectItem value="coupe">Coupe</SelectItem>
                  <SelectItem value="convertible">Convertible</SelectItem>
                  <SelectItem value="minivan">Minivan</SelectItem>
                  <SelectItem value="pickup">Pickup Truck</SelectItem>
                  <SelectItem value="luxury">Luxury</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Transmission</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="automatic">Automatic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Fuel Type</Label>
              <Select value={fuelType} onValueChange={setFuelType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gasoline">Gasoline</SelectItem>
                  <SelectItem value="diesel">Diesel</SelectItem>
                  <SelectItem value="electric">Electric</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                  <SelectItem value="lpg">LPG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="editSeats">Seats</Label>
              <Input id="editSeats" type="number" min={1} max={50} value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Mileage Policy</Label>
              <Select value={mileagePolicy} onValueChange={setMileagePolicy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unlimited">Unlimited</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-7">
              <Switch checked={airConditioning} onCheckedChange={setAirConditioning} />
              <Label>Air Conditioning</Label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="editPlate">License Plate</Label>
              <Input id="editPlate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editPriceKm">Price per KM (€)</Label>
              <Input id="editPriceKm" type="number" min={0} step="0.01" value={pricePerKm} onChange={(e) => setPricePerKm(e.target.value)} placeholder="0.35" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="editVin">VIN</Label>
            <Input id="editVin" value={vin} onChange={(e) => setVin(e.target.value)} />
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
