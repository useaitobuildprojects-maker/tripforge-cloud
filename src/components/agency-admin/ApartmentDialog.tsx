import { useEffect, useState } from 'react';
import { Plus, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Apartment, AMENITY_OPTIONS, useUpsertApartment, useUploadApartmentPhoto } from '@/hooks/use-apartments';

interface Props {
  agencyId: string;
  apartment?: Apartment | null;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}

const ApartmentDialog = ({ agencyId, apartment, open: controlledOpen, onOpenChange }: Props) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [bedrooms, setBedrooms] = useState('1');
  const [bathrooms, setBathrooms] = useState('1');
  const [maxGuests, setMaxGuests] = useState('2');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [nightlyRate, setNightlyRate] = useState('0');
  const [cleaningFee, setCleaningFee] = useState('0');
  const [status, setStatus] = useState('available');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);

  const upsert = useUpsertApartment();
  const upload = useUploadApartmentPhoto();

  useEffect(() => {
    if (apartment && open) {
      setTitle(apartment.title);
      setDescription(apartment.description ?? '');
      setBedrooms(String(apartment.bedrooms));
      setBathrooms(String(apartment.bathrooms));
      setMaxGuests(String(apartment.max_guests));
      setAddress(apartment.address ?? '');
      setCity(apartment.city);
      setCountry(apartment.country);
      setNightlyRate(String(apartment.nightly_rate));
      setCleaningFee(String(apartment.cleaning_fee));
      setStatus(apartment.status);
      setAmenities(apartment.amenities ?? []);
      setPhotos(apartment.photos ?? []);
    } else if (!apartment && open) {
      setTitle(''); setDescription(''); setBedrooms('1'); setBathrooms('1');
      setMaxGuests('2'); setAddress(''); setCity(''); setCountry('');
      setNightlyRate('0'); setCleaningFee('0'); setStatus('available');
      setAmenities([]); setPhotos([]);
    }
  }, [apartment, open]);

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    for (const file of Array.from(files)) {
      const url = await upload.mutateAsync({ file, agencyId });
      setPhotos((prev) => [...prev, url]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !city.trim() || !country.trim()) return;
    await upsert.mutateAsync({
      id: apartment?.id,
      agency_id: agencyId,
      title: title.trim(),
      description: description.trim() || null,
      photos,
      bedrooms: parseInt(bedrooms) || 1,
      bathrooms: parseInt(bathrooms) || 1,
      max_guests: parseInt(maxGuests) || 1,
      address: address.trim() || null,
      city: city.trim(),
      country: country.trim(),
      nightly_rate: parseFloat(nightlyRate) || 0,
      cleaning_fee: parseFloat(cleaningFee) || 0,
      amenities,
      status: status as any,
    });
    setOpen(false);
  };

  const isPending = upsert.isPending || upload.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {!apartment && controlledOpen === undefined && (
        <DialogTrigger asChild>
          <Button className="gap-2 rounded-xl">
            <Plus className="h-4 w-4" /> Add Apartment
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{apartment ? 'Edit Apartment' : 'Add New Apartment'}</DialogTitle>
          <DialogDescription>Manage your short-term rental listing.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Cozy 2BR near city center" />
          </div>

          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Bedrooms</Label><Input type="number" min={0} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Bathrooms</Label><Input type="number" min={0} value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Max Guests</Label><Input type="number" min={1} value={maxGuests} onChange={(e) => setMaxGuests(e.target.value)} /></div>
          </div>

          <div className="space-y-1.5">
            <Label>Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building, etc." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>City *</Label><Input value={city} onChange={(e) => setCity(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Country *</Label><Input value={country} onChange={(e) => setCountry(e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5"><Label>Nightly Rate</Label><Input type="number" min={0} step="0.01" value={nightlyRate} onChange={(e) => setNightlyRate(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Cleaning Fee</Label><Input type="number" min={0} step="0.01" value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="booked">Booked</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Amenities</Label>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1.5 rounded-md text-xs border transition-colors capitalize ${
                    amenities.includes(a)
                      ? 'bg-accent text-accent-foreground border-accent'
                      : 'bg-background text-muted-foreground border-border hover:border-accent/40'
                  }`}
                >
                  {a.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((url) => (
                <div key={url} className="relative group">
                  <img src={url} alt="" className="w-full h-24 object-cover rounded-md" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter(u => u !== url))}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-border p-4 hover:border-accent/40 transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload photos</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isPending || !title.trim() || !city.trim() || !country.trim()}>
            {isPending ? 'Saving...' : apartment ? 'Save Changes' : 'Add Apartment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApartmentDialog;
