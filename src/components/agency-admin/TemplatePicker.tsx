import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { StorefrontTemplate, STOREFRONT_TEMPLATES } from '@/types/storefront-templates';

interface TemplatePickerProps {
  value: StorefrontTemplate;
  onChange: (template: StorefrontTemplate) => void;
}

const TemplateMiniPreview = ({ template, selected }: { template: typeof STOREFRONT_TEMPLATES[0]; selected: boolean }) => {
  const p = template.preview;

  return (
    <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border-2 transition-all"
      style={{ borderColor: selected ? p.accent : 'transparent' }}
    >
      {/* Mini header */}
      <div className="h-[12%] flex items-center px-2 gap-1" style={{ backgroundColor: p.headerBg }}>
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: p.accent }} />
        <div className="flex-1" />
        <div className="w-4 h-1 rounded-full" style={{ backgroundColor: p.accent, opacity: 0.4 }} />
        <div className="w-4 h-1 rounded-full ml-1" style={{ backgroundColor: p.accent, opacity: 0.4 }} />
      </div>
      {/* Mini hero */}
      <div className="h-[35%] flex flex-col items-center justify-center" style={{ backgroundColor: p.heroBg }}>
        <div className="w-[60%] h-1.5 rounded-full mb-1" style={{ backgroundColor: p.heroText, opacity: 0.8 }} />
        <div className="w-[40%] h-1 rounded-full" style={{ backgroundColor: p.heroText, opacity: 0.4 }} />
      </div>
      {/* Mini body */}
      <div className="flex-1 p-2 flex gap-1.5" style={{ backgroundColor: p.bodyBg }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-1 rounded" style={{ backgroundColor: p.cardBg, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <div className="h-[55%] rounded-t" style={{ backgroundColor: p.heroBg, opacity: 0.1 }} />
          </div>
        ))}
      </div>
      {/* Selected check */}
      {selected && (
        <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full flex items-center justify-center" style={{ backgroundColor: p.accent }}>
          <Check className="h-3 w-3 text-white" />
        </div>
      )}
    </div>
  );
};

const TemplatePicker = ({ value, onChange }: TemplatePickerProps) => {
  return (
    <div className="grid grid-cols-3 gap-4">
      {STOREFRONT_TEMPLATES.map((template) => {
        const selected = value === template.id;
        return (
          <motion.button
            key={template.id}
            type="button"
            onClick={() => onChange(template.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`text-left rounded-xl border-2 p-3 transition-all ${
              selected
                ? 'border-accent bg-accent/5 shadow-md'
                : 'border-border hover:border-muted-foreground/30 bg-secondary/20'
            }`}
          >
            <TemplateMiniPreview template={template} selected={selected} />
            <h4 className="text-sm font-bold text-foreground mt-3">{template.name}</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{template.description}</p>
          </motion.button>
        );
      })}
    </div>
  );
};

export default TemplatePicker;
