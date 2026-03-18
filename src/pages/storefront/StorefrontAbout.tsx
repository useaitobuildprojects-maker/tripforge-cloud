import { useOutletContext } from 'react-router-dom';
import { Agency } from '@/types/agency';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const StorefrontAbout = () => {
  const { agency, templateStyles: ts } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles }>();

  const values = [
    { icon: Shield, title: 'Trust & Safety', desc: 'Every vehicle is thoroughly inspected and insured for your peace of mind.' },
    { icon: Award, title: 'Premium Quality', desc: 'We maintain a curated fleet of top-tier vehicles from leading manufacturers.' },
    { icon: Users, title: 'Customer First', desc: 'Our dedicated team is available around the clock to assist you.' },
    { icon: Clock, title: 'Flexibility', desc: 'Easy booking, free cancellation, and flexible rental periods.' },
  ];

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="about"
        fallbackTitle={`About Us | ${agency.name}`}
        fallbackDescription={`Learn more about ${agency.name}, your trusted travel partner in ${agency.city}, ${agency.country}.`}
      />

      <section className={`py-16 ${ts.subHeroClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">About {agency.name}</h1>
            <p className="opacity-60 max-w-2xl mx-auto">
              Your trusted partner for premium travel services in {agency.city}, {agency.country}.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <h2 className="text-2xl font-bold mb-4">Our Story</h2>
            <div className="space-y-4 opacity-60 leading-relaxed">
              <p>
                Founded with a passion for exceptional travel experiences, {agency.name} has grown into one of the most trusted
                travel service providers in {agency.city}. We believe that every journey should be memorable, comfortable, and hassle-free.
              </p>
              <p>
                Our team of dedicated professionals works tirelessly to ensure that every customer receives personalized attention
                and the highest quality of service, from the moment you book to the moment you return.
              </p>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-2xl h-64 flex items-center justify-center ${ts.subHeroClass}`}
          >
            <div className="text-center">
              <p className="text-5xl font-bold mb-1">{agency.name.charAt(0)}</p>
              <p className="text-sm opacity-50">{agency.city}, {agency.country}</p>
            </div>
          </motion.div>
        </div>

        {/* Values */}
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Our Values</h2>
          <p className="opacity-60">What makes us different</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className={`p-6 text-center ${ts.cardClass}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg mx-auto mb-4 ${ts.iconBgClass}`}>
                <v.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold mb-2">{v.title}</h3>
              <p className="text-sm opacity-60">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default StorefrontAbout;
