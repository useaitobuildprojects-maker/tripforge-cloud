import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock, ArrowRight } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';
import { Button } from '@/components/ui/button';
import destTemple from '@/assets/dest-temple.jpg';
import adventureMountain from '@/assets/adventure-mountain.jpg';

const DEFAULT_VALUES = [
  { title: 'Safety first', description: 'Every vehicle is inspected and insured for your peace of mind.', icon: Shield },
  { title: 'Premium quality', description: 'A curated fleet of top-tier vehicles from leading manufacturers.', icon: Award },
  { title: 'Customer first', description: 'Our team is available around the clock to assist you.', icon: Users },
  { title: 'Flexibility', description: 'Easy booking, free cancellation, and flexible rental periods.', icon: Clock },
];

const ICONS = [Shield, Award, Users, Clock];

const STATS = [
  { value: '10K+', label: 'Happy Travelers' },
  { value: '500+', label: 'Destinations' },
  { value: '99%', label: 'Satisfaction' },
  { value: '24/7', label: 'Support' },
];

const StorefrontAbout = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const values = cfg.about_values && cfg.about_values.length > 0
    ? cfg.about_values.map((v, i) => ({ ...v, icon: ICONS[i % ICONS.length] }))
    : DEFAULT_VALUES;

  return (
    <div className="bg-white">
      <StorefrontSeo
        agency={agency}
        page="about"
        fallbackTitle={`About Us | ${agency.name}`}
        fallbackDescription={`Learn more about ${agency.name}, your trusted travel partner in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero */}
      <section className="bg-black py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              {cfg.about_title || `About ${agency.name}`}
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              {cfg.about_subtitle || `Your trusted partner for premium travel services in ${agency.city}, ${agency.country}.`}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="text-center py-4"
              >
                <p className="text-3xl md:text-4xl font-bold text-black">{stat.value}</p>
                <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6 tracking-tight">Our story</h2>
            <div className="space-y-5 text-gray-500 leading-relaxed">
              <p>
                {cfg.about_story_1 || `Founded with a passion for exceptional travel experiences, ${agency.name} has grown into one of the most trusted travel service providers in ${agency.city}. We believe that every journey should be memorable, comfortable, and hassle-free.`}
              </p>
              <p>
                {cfg.about_story_2 || `Our team of dedicated professionals works tirelessly to ensure that every customer receives personalized attention and the highest quality of service.`}
              </p>
            </div>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-lg font-semibold gap-2 text-white px-8 h-11 text-sm mt-8 bg-black hover:bg-gray-800">
                Get in touch <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="rounded-2xl overflow-hidden">
              <img src={cfg.about_image_url || destTemple} alt={`About ${agency.name}`} className="w-full h-80 lg:h-[420px] object-cover" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-black mb-12 tracking-tight">Why choose us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.06 * i }}
                className="bg-white p-8 rounded-2xl"
              >
                <v.icon className="h-7 w-7 text-black mb-5" />
                <h3 className="font-bold text-black mb-2">{v.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={adventureMountain} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/80" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">Ready to explore?</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">Premium service, professional team, and memorable experiences await.</p>
            <Link to={`/agency/${slug}/services`}>
              <Button className="rounded-lg font-semibold gap-2 bg-white text-black px-10 h-12 text-sm hover:bg-gray-100">
                View our services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontAbout;
