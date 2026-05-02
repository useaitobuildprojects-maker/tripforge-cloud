import { useOutletContext, Link, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Shield, Award, Users, Clock, ArrowRight, Heart } from 'lucide-react';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from "@/lib/template-styles";
import { Button } from '@/components/ui/button';
import destTemple from '@/assets/dest-temple.jpg';
import adventureMountain from '@/assets/adventure-mountain.jpg';

const DEFAULT_VALUES = [
  { title: 'Trust & Safety', description: 'Every vehicle is thoroughly inspected and insured for your peace of mind.', icon: Shield },
  { title: 'Premium Quality', description: 'We maintain a curated fleet of top-tier vehicles from leading manufacturers.', icon: Award },
  { title: 'Customer First', description: 'Our dedicated team is available around the clock to assist you.', icon: Users },
  { title: 'Flexibility', description: 'Easy booking, free cancellation, and flexible rental periods.', icon: Clock },
];

const ICONS = [Shield, Award, Users, Clock];
const serifFont = { fontFamily: "'Inter', system-ui, sans-serif", fontWeight: 800, letterSpacing: '-0.02em' };

const STATS = [
  { value: '10K+', label: 'Happy Travelers' },
  { value: '500+', label: 'Destinations' },
  { value: '99%', label: 'Satisfaction Rate' },
  { value: '24/7', label: 'Customer Support' },
];

const StorefrontAbout = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;
  const EXP = ts.palette;
  const accent = ts.isDark ? buttonColor : EXP.brand;
  const ctaBg = ts.isDark ? buttonColor : EXP.cta;
  const ctaTextColor = ts.isDark ? '#ffffff' : EXP.ctaText;

  const values = cfg.about_values && cfg.about_values.length > 0
    ? cfg.about_values.map((v, i) => ({ ...v, icon: ICONS[i % ICONS.length] }))
    : DEFAULT_VALUES;

  return (
    <div style={tk.surface}>
      <StorefrontSeo
        agency={agency}
        page="about"
        fallbackTitle={`About Us | ${agency.name}`}
        fallbackDescription={`Learn more about ${agency.name}, your trusted travel partner in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ ...tk.surfaceDeep, minHeight: '340px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '340px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: accent }}>Our Story</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5" style={{ ...serifFont, ...tk.textOnDeep }}>
              {cfg.about_title || `About ${agency.name}`}
            </h1>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={tk.textOnDeepMuted}>
              {cfg.about_subtitle || `Your trusted partner for premium travel services in ${agency.city}, ${agency.country}.`}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C360 0 720 0 1080 30C1260 45 1350 52 1440 60H0Z" fill={ts.surfaceFill} /></svg>
        </div>
      </section>

      {/* Stats bar */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <motion.div key={stat.label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="text-center py-6 px-4 rounded-2xl border shadow-sm"
              style={{ ...tk.surface, ...tk.border }}>
              <p className="text-2xl md:text-3xl font-bold" style={{ ...serifFont, ...tk.textPrimary }}>{stat.value}</p>
              <p className="text-xs mt-1 font-medium" style={tk.textMuted}>{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>Who We Are</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ ...serifFont, ...tk.textPrimary }}>Our Story</h2>
            <div className="space-y-5 leading-relaxed" style={tk.textBody}>
              <p>{cfg.about_story_1 || `Founded with a passion for exceptional travel experiences, ${agency.name} has grown into one of the most trusted travel service providers in ${agency.city}. We believe that every journey should be memorable, comfortable, and hassle-free.`}</p>
              <p>{cfg.about_story_2 || `Our team of dedicated professionals works tirelessly to ensure that every customer receives personalized attention and the highest quality of service, from the moment you book to the moment you return.`}</p>
            </div>
            <Link to={`/agency/${slug}/contact`}>
              <Button className="rounded-xl font-bold gap-2 px-8 h-12 text-sm mt-8 hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
                Get In Touch <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="relative">
            <div className="rounded-3xl overflow-hidden shadow-xl">
              {cfg.about_image_url ? (
                <img src={cfg.about_image_url} alt={`About ${agency.name}`} className="w-full h-80 lg:h-[420px] object-cover" />
              ) : (
                <img src={destTemple} alt="Travel" className="w-full h-80 lg:h-[420px] object-cover" />
              )}
            </div>
            <div className="absolute -bottom-6 -left-4 rounded-2xl shadow-lg p-5 border" style={{ ...tk.surface, ...tk.border }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}15` }}>
                  <Heart className="h-5 w-5" style={{ color: accent }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={tk.textPrimary}>Trusted by thousands</p>
                  <p className="text-xs" style={tk.textMuted}>Since establishment</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24" style={tk.surfaceAlt}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style={{ color: accent }}>Why Choose Us</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-3" style={{ ...serifFont, ...tk.textPrimary }}>Our Values</h2>
            <p className="max-w-lg mx-auto" style={tk.textMuted}>The principles that guide everything we do</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.08 * i, duration: 0.5 }}
                className="p-8 rounded-2xl border text-center hover:shadow-lg transition-shadow duration-300"
                style={{ ...tk.surface, ...tk.border }}>
                <div className="h-14 w-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${accent}12` }}>
                  <v.icon className="h-6 w-6" style={{ color: accent }} />
                </div>
                <h3 className="font-bold mb-2" style={tk.textPrimary}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={tk.textMuted}>{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={adventureMountain} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={serifFont}>Ready to Explore?</h2>
            <p className="text-white/40 mb-8 max-w-lg mx-auto">Let us help you plan an unforgettable journey. Premium service, professional team, and memorable experiences await.</p>
            <Link to={`/agency/${slug}/services`}>
              <Button className="rounded-xl font-bold gap-2 px-10 h-12 text-sm hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
                View Our Services <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontAbout;
