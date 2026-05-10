import economyImg from '@/assets/vehicle-class-economy.png';
import businessImg from '@/assets/vehicle-class-business.png';
import firstClassImg from '@/assets/vehicle-class-first.png';
import vanImg from '@/assets/vehicle-class-van.png';
import suvImg from '@/assets/vehicle-class-suv.png';

export const VEHICLE_CLASS_IMAGES: Record<string, string> = {
  economy: economyImg,
  business: businessImg,
  first_class: firstClassImg,
  van: vanImg,
  suv: suvImg,
};

export const getVehicleClassImage = (category?: string | null): string =>
  (category && VEHICLE_CLASS_IMAGES[category]) || businessImg;