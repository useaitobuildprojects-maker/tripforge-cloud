import { useOutletContext } from 'react-router-dom';
import { Agency } from '@/types/agency';
import { motion } from 'framer-motion';
import { Car, Users, Fuel, Settings2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const StorefrontFleet = () => {
  const { agency, templateStyles: ts, buttonColor } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string }>();

  const sampleCars = [
    { name: 'Hyundai Tucson', year: 2021, type: 'SUV', price: 150, rating: 4.5, reviews: 450, seats: 5, transmission: 'Manual', fuel: '90L' },
    { name: 'BMW X5', year: 2023, type: 'SUV', price: 220, rating: 4.8, reviews: 320, seats: 5, transmission: 'Automatic', fuel: '85L' },
    { name: 'Mercedes C-Class', year: 2022, type: 'Sedan', price: 180, rating: 4.6, reviews: 280, seats: 5, transmission: 'Automatic', fuel: '66L' },
    { name: 'Audi Q7', year: 2023, type: 'SUV', price: 250, rating: 4.7, reviews: 195, seats: 7, transmission: 'Automatic', fuel: '85L' },
    { name: 'Toyota Corolla', year: 2023, type: 'Sedan', price: 95, rating: 4.4, reviews: 520, seats: 5, transmission: 'Manual', fuel: '50L' },
    { name: 'Range Rover Sport', year: 2024, type: 'SUV', price: 350, rating: 4.9, reviews: 140, seats: 5, transmission: 'Automatic', fuel: '90L' },
  ];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="fleet"
        fallbackTitle={`Our Fleet | ${agency.name}`}
        fallbackDescription={`Browse our premium fleet of vehicles available for rent at ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero */}
      <section className={`py-16 ${ts.subHeroClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Fleet</h1>
            <p className="opacity-60 max-w-2xl mx-auto">
              Explore our carefully curated selection of premium vehicles, ready for your next adventure in {agency.city}.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCars.map((car, i) => (
            <motion.div
              key={car.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`overflow-hidden transition-shadow ${ts.cardClass} ${ts.cardHoverClass}`}
            >
              <div className="h-48 flex items-center justify-center opacity-20">
                <Car className="h-16 w-16" />
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold">{car.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full opacity-60 border border-current/20">{car.type}</span>
                </div>
                <p className="text-xs opacity-50 mb-3">{car.year}</p>
                <div className="flex items-center gap-1 mb-3">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{car.rating}</span>
                  <span className="text-xs opacity-50">({car.reviews})</span>
                </div>
                <div className="flex items-center gap-4 text-xs opacity-50 mb-4">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{car.seats}</span>
                  <span className="flex items-center gap-1"><Settings2 className="h-3.5 w-3.5" />{car.transmission}</span>
                  <span className="flex items-center gap-1"><Fuel className="h-3.5 w-3.5" />{car.fuel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">${car.price}<span className="text-xs font-normal opacity-50">/day</span></p>
                  <Button size="sm" className={`rounded-lg ${ts.primaryBtnClass}`}>Book Now</Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorefrontFleet;
