import { Car, UserCheck, Hotel, Globe } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/types/agency';

const iconMap = {
  car_rental: Car,
  private_driver: UserCheck,
  hotel: Hotel,
  travel_package: Globe,
};

const ServiceBadge = ({ service }: { service: ServiceType }) => {
  const Icon = iconMap[service];

  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-secondary px-2 py-1 text-[11px] font-medium text-secondary-foreground">
      <Icon className="h-3 w-3" />
      {SERVICE_LABELS[service]}
    </span>
  );
};

export default ServiceBadge;
