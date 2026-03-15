import { useOutletContext } from 'react-router-dom';
import { Agency } from '@/types/agency';
import { motion } from 'framer-motion';
import { Search, MapPin, Calendar, Clock, Phone, Shield, Star, ChevronRight, Car, Users, Fuel, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';

const StorefrontHome = () => {
  const { agency } = useOutletContext<{ agency: Agency }>();

  const sampleCars = [
    { name: 'Hyundai Tucson', year: 2021, type: 'SUV', price: 150, rating: 4.5, reviews: 450, seats: 5, transmission: 'Manual', fuel: '90L' },
    { name: 'BMW X5', year: 2023, type: 'SUV', price: 220, rating: 4.8, reviews: 320, seats: 5, transmission: 'Automatic', fuel: '85L' },
    { name: 'Mercedes C-Class', year: 2022, type: 'Sedan', price: 180, rating: 4.6, reviews: 280, seats: 5, transmission: 'Automatic', fuel: '66L' },
    { name: 'Audi Q7', year: 2023, type: 'SUV', price: 250, rating: 4.7, reviews: 195, seats: 7, transmission: 'Automatic', fuel: '85L' },
  ];

  const testimonials = [
    { name: 'Eva Hicks', text: 'Excellent service and well-maintained vehicles. The staff was incredibly helpful throughout the entire rental process.', rating: 5 },
    { name: 'Donald Wolf', text: 'Best car rental experience I\'ve ever had. Will definitely be coming back for our next trip!', rating: 5 },
    { name: 'Sarah Klein', text: 'Great selection of vehicles and transparent pricing. The booking process was seamless.', rating: 4 },
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight tracking-tight">
              Promote Mobility: Rent a Car<br />Tailored to Your Needs
            </h1>
            <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
              Discover the best deals on car rentals at {agency.name} in {agency.city}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 md:p-6">
          <div className="flex items-center gap-6 mb-4">
            <label className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer">
              <input type="radio" name="trip" defaultChecked className="accent-accent" /> Pick-up
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-muted-foreground cursor-pointer">
              <input type="radio" name="trip" className="accent-accent" /> Drop-off
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <select className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 appearance-none">
                  <option>Select your city</option>
                  <option>{agency.city}</option>
                </select>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="date" className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="time" className="w-full h-11 rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20" />
              </div>
            </div>
            <div>
              <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg font-semibold gap-2">
                <Search className="h-4 w-4" /> Search
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Why Choose Us */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-12">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Phone, title: 'Customer Support', desc: 'Our dedicated team is available 24/7 to assist you with any questions or issues.' },
            { icon: Shield, title: 'Best Price Guarantee', desc: 'We guarantee the best prices on all our vehicles with no hidden fees.' },
            { icon: MapPin, title: 'Many Locations', desc: 'Pick up and drop off your vehicle at convenient locations across the region.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow border border-gray-50">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/5 text-primary mb-5">
                <item.icon className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Car */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-primary rounded-2xl overflow-hidden">
          <div className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-white">
              <span className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">Best Offer</span>
              <h3 className="text-2xl md:text-3xl font-bold mt-2 mb-1">Hyundai Tucson 2021 SUV</h3>
              <p className="text-white/40 text-sm line-through mb-0.5">$200,000 / day</p>
              <p className="text-2xl font-bold text-accent">$150,000 / day</p>
              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-accent text-accent" />
                ))}
                <span className="text-xs text-white/50 ml-1">(450 recommends)</span>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="w-80 h-48 bg-white/5 rounded-xl flex items-center justify-center">
                <Car className="h-24 w-24 text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Car Listings */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">Best Cars & Deals</h2>
        <p className="text-center text-sm text-muted-foreground mb-10 max-w-lg mx-auto">Find the perfect car for your journey with competitive prices and top-quality vehicles.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleCars.map((car, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.5 }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-lg transition-all group">
              <div className="h-44 bg-gray-50 flex items-center justify-center">
                <Car className="h-16 w-16 text-gray-300 group-hover:text-primary/30 transition-colors" />
              </div>
              <div className="p-4">
                <h4 className="font-bold text-foreground text-sm">{car.name} {car.year} {car.type}</h4>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Fuel className="h-3 w-3" /> {car.fuel}</span>
                  <span className="flex items-center gap-1"><Settings2 className="h-3 w-3" /> {car.transmission}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {car.seats} People</span>
                </div>
                <div className="flex items-center gap-1 mt-2">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className={`h-3 w-3 ${j < Math.floor(car.rating) ? 'fill-accent text-accent' : 'text-gray-200'}`} />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">({car.reviews} recommends)</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                  <div>
                    <span className="text-xs text-muted-foreground line-through">${(car.price * 1.2).toLocaleString()}</span>
                    <p className="text-base font-bold text-foreground">${car.price.toLocaleString()} <span className="text-xs font-normal text-muted-foreground">/ day</span></p>
                  </div>
                  <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg text-xs h-9 px-4">
                    Book now
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors flex items-center gap-1 mx-auto">
            View more cars <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Blog Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">Blog</h2>
          <p className="text-center text-sm text-muted-foreground mb-10 max-w-lg mx-auto">
            Discover the latest news and useful articles about car rental and travel tips
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all border border-gray-100">
                <div className="h-48 bg-gray-100" />
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-foreground uppercase">Blog Title</span>
                    <span className="text-[10px] text-accent font-medium uppercase">Category</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">Author · a min ago</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover useful tips and insights about car rental, travel, and getting the most from your journey.
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button className="text-sm font-medium text-accent hover:text-accent/80 transition-colors">More →</button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-3">Trusted by Thousands of Happy Customers</h2>
        <p className="text-center text-sm text-muted-foreground mb-12 max-w-lg mx-auto">
          Our customers' opinions help us improve your experience and offer the best services
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`p-6 rounded-2xl border ${i === 1 ? 'bg-primary text-white border-primary' : 'bg-white border-gray-100'}`}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-sm font-bold ${i === 1 ? 'bg-white/20 text-white' : 'bg-gray-100 text-foreground'}`}>
                  {t.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(t.rating)].map((_, j) => (
                      <Star key={j} className={`h-3 w-3 fill-accent text-accent`} />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-sm leading-relaxed ${i === 1 ? 'text-white/80' : 'text-muted-foreground'}`}>{t.text}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorefrontHome;
