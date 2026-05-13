import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Agency, StorefrontConfig } from '@/types/agency';
import { TemplateStyles } from '@/lib/template-styles';

interface OutletContext {
  agency: Agency;
  templateStyles: TemplateStyles;
  buttonColor: string;
  config: StorefrontConfig;
}

const PaymentCancel = () => {
  const { agency, buttonColor } = useOutletContext<OutletContext>();
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('booking');

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-lg w-full text-center space-y-6"
      >
        <div className="mx-auto h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
            Payment cancelled
          </h1>
          <p className="text-muted-foreground mt-2">
            Your booking has been held. You can retry payment or contact {agency.name} for assistance.
          </p>
          {bookingId && (
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Ref: {bookingId.slice(0, 8).toUpperCase()}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link to={`/agency/${agency.slug}`} className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full h-11 rounded-xl font-bold"
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to home
            </Button>
          </Link>
          <Link to={`/agency/${agency.slug}/contact`} className="w-full sm:w-auto">
            <Button
              className="w-full h-11 rounded-xl font-bold text-white"
              style={{ backgroundColor: buttonColor }}
            >
              <HelpCircle className="h-4 w-4 mr-2" /> Contact support
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentCancel;
