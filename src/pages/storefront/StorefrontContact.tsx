import { useOutletContext, useParams } from 'react-router-dom';
import { Agency, StorefrontConfig } from '@/types/agency';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Clock, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import StorefrontSeo from '@/components/storefront/StorefrontSeo';
import { TemplateStyles } from '@/lib/template-styles';

const serifFont = { fontFamily: "'Georgia', 'Times New Roman', serif" };

const StorefrontContact = () => {
  const { slug } = useParams();
  const { agency, templateStyles: ts, buttonColor, config: cfg } = useOutletContext<{ agency: Agency; templateStyles: TemplateStyles; buttonColor: string; config: StorefrontConfig }>();
  const tk = ts.tokens;

  const contactItems = [
    { icon: Mail, title: 'Email Us', value: agency.contact_email, subtitle: 'We reply within 24 hours' },
    { icon: MapPin, title: 'Visit Us', value: `${agency.city}, ${agency.country}`, subtitle: 'Our main office' },
    { icon: Phone, title: 'Call Us', value: cfg.phone || '+1 (555) 000-0000', subtitle: 'Mon–Fri, 8am–8pm' },
    { icon: Clock, title: 'Working Hours', value: cfg.working_hours || 'Mon–Fri: 8:00 AM – 8:00 PM', subtitle: cfg.working_hours_weekend || 'Weekend: By appointment' },
  ];

  return (
    <div style={tk.surface}>
      <StorefrontSeo
        agency={agency}
        page="contact"
        fallbackTitle={`Contact Us | ${agency.name}`}
        fallbackDescription={`Get in touch with ${agency.name} in ${agency.city}, ${agency.country}. We're here to help with your travel needs.`}
      />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ ...tk.surfaceDeep, minHeight: '340px' }}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '340px' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.25em] uppercase mb-4" style={{ color: accent }}>Get In Touch</p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-5" style={{ ...serifFont, ...tk.textOnDeep }}>
              {cfg.contact_title || 'Contact Us'}
            </h1>
            <p className="max-w-xl mx-auto text-base leading-relaxed" style={tk.textOnDeepMuted}>
              {cfg.contact_subtitle || "Have a question or need assistance? We'd love to hear from you."}
            </p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full"><path d="M0 60V30C360 0 720 0 1080 30C1260 45 1350 52 1440 60H0Z" fill={ts.surfaceFill} /></svg>
        </div>
      </section>

      {/* Contact cards */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contactItems.map((item, i) => (
            <motion.div key={item.title}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="p-6 rounded-2xl border shadow-sm text-center hover:shadow-md transition-shadow"
              style={{ ...tk.surface, ...tk.border }}>
              <div className="h-12 w-12 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${accent}12` }}>
                <item.icon className="h-5 w-5" style={{ color: accent }} />
              </div>
              <h3 className="font-bold text-sm mb-1" style={tk.textPrimary}>{item.title}</h3>
              <p className="text-sm mb-0.5" style={tk.textBody}>{item.value}</p>
              <p className="text-xs" style={tk.textMuted}>{item.subtitle}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Form section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: accent }}>Let's Talk</p>
            <h2 className="text-3xl lg:text-4xl font-bold mb-6" style={{ ...serifFont, ...tk.textPrimary }}>
              Send Us a Message
            </h2>
            <p className="leading-relaxed mb-8" style={tk.textBody}>
              Whether you need help planning your trip, have questions about our services, or want to provide feedback — we're always happy to hear from you. Fill out the form and our team will get back to you promptly.
            </p>

            <div className="space-y-5">
              {contactItems.slice(0, 3).map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={tk.surfaceAlt}>
                    <item.icon className="h-5 w-5" style={tk.textMuted} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={tk.textPrimary}>{item.title}</p>
                    <p className="text-sm" style={tk.textMuted}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className="rounded-3xl p-8 lg:p-10" style={tk.surfaceAlt}>
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="c-name" className="text-sm font-medium" style={tk.textPrimary}>Full Name</Label>
                    <Input id="c-name" placeholder="John Doe" className="rounded-xl h-12" style={{ ...tk.inputSurface, ...tk.inputBorder }} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="c-email" className="text-sm font-medium" style={tk.textPrimary}>Email</Label>
                    <Input id="c-email" type="email" placeholder="john@example.com" className="rounded-xl h-12" style={{ ...tk.inputSurface, ...tk.inputBorder }} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-phone" className="text-sm font-medium" style={tk.textPrimary}>Phone (optional)</Label>
                  <Input id="c-phone" type="tel" placeholder="+1 (555) 000-0000" className="rounded-xl h-12" style={{ ...tk.inputSurface, ...tk.inputBorder }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-subject" className="text-sm font-medium" style={tk.textPrimary}>Subject</Label>
                  <Input id="c-subject" placeholder="How can we help?" className="rounded-xl h-12" style={{ ...tk.inputSurface, ...tk.inputBorder }} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c-message" className="text-sm font-medium" style={tk.textPrimary}>Message</Label>
                  <textarea id="c-message" rows={5} placeholder="Tell us more about your travel plans..."
                    className="w-full rounded-xl border px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    style={{ ...tk.inputSurface, ...tk.inputBorder }} />
                </div>
                <Button type="submit" className="w-full rounded-xl gap-2 h-12 font-semibold text-sm hover:brightness-95" style={{ backgroundColor: ctaBg, color: ctaTextColor }}>
                  <Send className="h-4 w-4" /> Send Message
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20" style={tk.surfaceDeep}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <MessageCircle className="h-10 w-10 mx-auto mb-5" style={tk.textOnDeepMuted} />
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ ...serifFont, ...tk.textOnDeep }}>We're Here to Help</h2>
            <p className="mb-4 max-w-lg mx-auto" style={tk.textOnDeepMuted}>Located in {agency.city}, {agency.country}. Our team is ready to assist you with any travel needs.</p>
            {cfg.phone && (
              <a href={`tel:${cfg.phone}`} className="inline-flex items-center gap-2 text-sm font-semibold mt-2" style={{ color: accent }}>
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
