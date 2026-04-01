import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useOutletContext } from 'react-router-dom';
import { Agency, SERVICE_LABELS, ServiceType, StorefrontPage, PAGE_LABELS, PageSeo, PageSeoEntry, StorefrontTemplate, StorefrontConfig } from '@/types/agency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUpdateAgency } from '@/hooks/use-agency-mutations';
import { useAgencyImageUpload } from '@/hooks/use-agency-image-upload';
import { Upload, Image } from 'lucide-react';
import TemplatePicker from '@/components/agency-admin/TemplatePicker';
import StorefrontConfigEditor from '@/components/agency-admin/StorefrontConfigEditor';
import ServicePricingEditor from '@/components/agency-admin/ServicePricingEditor';


      {/* Marketplace Commission */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-premium rounded-xl p-7 space-y-4"
      >
        <div>
          <h2 className="text-lg font-display font-bold text-foreground">Marketplace Commission</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your storefront shows vehicles from all agencies. Set a commission percentage added to partner vehicles' prices.
          </p>
        </div>
        <div className="space-y-3">
          <Label>Commission Rate (%)</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={50}
              step={1}
              value={commissionRate}
              onChange={(e) => setCommissionRate(Number(e.target.value))}
              className="w-28 font-mono"
            />
            <span className="text-sm text-muted-foreground">%</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Example: A partner vehicle at $100/day shows as <strong>${Math.round(100 * (1 + commissionRate / 100))}/day</strong> on your storefront.
          </p>
        </div>
        <div className="space-y-3">
          <Label>One-Way Drop-off Fee (€)</Label>
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={0}
              max={500}
              step={5}
              value={oneWayFee}
              onChange={(e) => setOneWayFee(Number(e.target.value))}
              className="w-28 font-mono"
            />
            <span className="text-sm text-muted-foreground">€</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Charged when customers return the vehicle to a different location.
          </p>
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateAgency.isPending}
          className="gradient-accent text-accent-foreground rounded-xl font-semibold px-8"
        >
          {updateAgency.isPending ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
};

export default AgencyAdminSettings;
