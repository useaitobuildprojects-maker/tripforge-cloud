import { useOutletContext, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const StorefrontContact = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  const contactItems = [
    { icon: Mail, title: 'Email', value: agency.contact_email, subtitle: 'We reply within 24 hours' },
    { icon: MapPin, title: 'Location', value: `${agency.city}, ${agency.country}`, subtitle: 'Our main office' },
    { icon: Phone, title: 'Phone', value: cfg.phone || '+1 (555) 000-0000', subtitle: 'Mon–Fri, 8am–8pm' },
    { icon: Clock, title: 'Hours', value: cfg.working_hours || 'Mon–Fri: 8:00 AM – 8:00 PM', subtitle: cfg.working_hours_weekend || 'Weekend: By appointment' },
  ];

  return (
    <div className="bg-white">
      <StorefrontSeo
        agency={agency}
        page="contact"
        fallbackTitle={`Contact Us | ${agency.name}`}
        fallbackDescription={`Get in touch with ${agency.name} in ${agency.city}, ${agency.country}.`}
      />

      {/* Hero */}
      <section className="bg-black py-20 lg:py-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-5">
              {cfg.contact_title || 'Contact us'}
            </h1>
            <p className="text-white/40 text-base leading-relaxed">
              {cfg.contact_subtitle || "Have a question or need assistance? We'd love to hear from you."}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactItems.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="p-6 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <item.icon className="h-6 w-6 text-black mb-4" />
              <h3 className="font-bold text-black text-sm mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600 mb-0.5">{item.value}</p>
              <p className="text-xs text-gray-400">{item.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl lg:text-4xl font-bold text-black mb-6 tracking-tight">
              Send us a message
            </h2>
            <p className="text-gray-500 leading-relaxed mb-8">
              Whether you need help planning your trip, have questions about our services, or want to provide feedback — we're always happy to hear from you.
            </p>

            <div className="space-y-5">
              {contactItems.slice(0, 3).map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-black">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — form */}
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <div className="bg-gray-50 rounded-2xl p-8 lg:p-10">
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name" className="text-gray-700 text-sm font-medium">Full Name</Label>
                    <Input id="c-name" placeholder="John Doe" className="rounded-lg border-gray-200 bg-white h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email" className="text-gray-700 text-sm font-medium">Email</Label>
                    <Input id="c-email" type="email" placeholder="john@example.com" className="rounded-lg border-gray-200 bg-white h-11" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone" className="text-gray-700 text-sm font-medium">Phone (optional)</Label>
                  <Input id="c-phone" type="tel" placeholder="+1 (555) 000-0000" className="rounded-lg border-gray-200 bg-white h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject" className="text-gray-700 text-sm font-medium">Subject</Label>
                  <Input id="c-subject" placeholder="How can we help?" className="rounded-lg border-gray-200 bg-white h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-message" className="text-gray-700 text-sm font-medium">Message</Label>
                  <textarea
                    id="c-message"
                    rows={5}
                    placeholder="Tell us more about your travel plans..."
                    className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg gap-2 text-white h-11 font-semibold text-sm bg-black hover:bg-gray-800">
                  <Send className="h-4 w-4" /> Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-black py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">We're here to help</h2>
            <p className="text-white/40 mb-4 max-w-lg mx-auto">Located in {agency.city}, {agency.country}. Our team is ready to assist you with any travel needs.</p>
            {cfg.phone && (
              <a href={`tel:${cfg.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold mt-2 text-white hover:text-white/80">
                <Phone className="h-4 w-4" /> {cfg.phone}
              </a>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontContact;
