import { useOutletContext } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const StorefrontContact = () => {
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();

  return (
    <div>
      <StorefrontSeo
        agency={agency}
        page="contact"
        fallbackTitle={`Contact Us | ${agency.name}`}
        fallbackDescription={`Get in touch with ${agency.name} in ${agency.city}, ${agency.country}. We're here to help with your travel needs.`}
      />

      <section className={`py-16 ${ts.subHeroClass}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Contact Us</h1>
            <p className="opacity-60 max-w-2xl mx-auto">
              Have a question or need assistance? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-5">
                {[
                  { icon: Mail, title: 'Email', value: agency.contact_email },
                  { icon: MapPin, title: 'Location', value: `${agency.city}, ${agency.country}` },
                  { icon: Phone, title: 'Phone', value: '+1 (555) 000-0000' },
                  { icon: Clock, title: 'Working Hours', value: 'Mon–Fri: 8:00 AM – 8:00 PM' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg shrink-0 ${ts.iconBgClass}`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{item.title}</p>
                      <p className="text-sm opacity-60">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className={`p-8 ${ts.cardClass}`}>
              <h3 className="text-lg font-bold mb-5">Send us a message</h3>
              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name">Full Name</Label>
                    <Input id="c-name" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email">Email</Label>
                    <Input id="c-email" type="email" placeholder="john@example.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject">Subject</Label>
                  <Input id="c-subject" placeholder="How can we help?" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-message">Message</Label>
                  <textarea
                    id="c-message"
                    rows={4}
                    placeholder="Tell us more..."
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button type="submit" className="w-full rounded-lg gap-2 text-white" style={{ backgroundColor: buttonColor }}>
                  <Send className="h-4 w-4" /> Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default StorefrontContact;
