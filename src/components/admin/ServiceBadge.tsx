import { Car, Building, HelpCircle, Navigation, Globe, Map } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/types/agency';

const iconMap: Record<string, any> = {
  car_rental: Car,
  apartment: Building,
  transfer: Navigation,
  limo_tour: Globe,
  city_tour: Map,
};

const ServiceBadge = ({ service }: { service: ServiceType }) => {
  const Icon = iconMap[service] || HelpCircle;
  const label = SERVICE_LABELS[service] || service;

  return (
    <span className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-primary/5 text-primary border border-primary/10">
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

export default ServiceBadge;
