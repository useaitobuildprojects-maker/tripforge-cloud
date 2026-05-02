export type StorefrontTemplate =
  | 'classic'
  | 'minimal'
  | 'elegant'
  | 'corporate'
  | 'fresh'
  | 'coastal'
  | 'blacklane'
  | 'sunset'
  | 'forest'
  | 'midnight';

export interface TemplateConfig {
  id: StorefrontTemplate;
  name: string;
  description: string;
  preview: {
    headerBg: string;
    heroBg: string;
    heroText: string;
    cardBg: string;
    accent: string;
    bodyBg: string;
  };
}

export const STOREFRONT_TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Clean white layout with subtle shadows and a professional feel',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#1a1f36',
      heroText: '#ffffff',
      cardBg: '#ffffff',
      accent: '#c8a951',
      bodyBg: '#f9fafb',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Ultra-clean design with light grays and crisp typography',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#f1f5f9',
      heroText: '#1e293b',
      cardBg: '#ffffff',
      accent: '#3b82f6',
      bodyBg: '#ffffff',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Warm tones with a luxury hospitality feel',
    preview: {
      headerBg: '#faf8f5',
      heroBg: '#2c1810',
      heroText: '#faf8f5',
      cardBg: '#faf8f5',
      accent: '#b8860b',
      bodyBg: '#f5f0eb',
    },
  },
  {
    id: 'corporate',
    name: 'Corporate',
    description: 'Polished navy blue header with a structured, business-ready layout',
    preview: {
      headerBg: '#1e3a5f',
      heroBg: '#1e3a5f',
      heroText: '#ffffff',
      cardBg: '#ffffff',
      accent: '#2563eb',
      bodyBg: '#f8fafc',
    },
  },
  {
    id: 'fresh',
    name: 'Fresh',
    description: 'Bright green accents with airy whites for a modern, eco-friendly vibe',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#f0fdf4',
      heroText: '#14532d',
      cardBg: '#ffffff',
      accent: '#16a34a',
      bodyBg: '#fafffe',
    },
  },
  {
    id: 'coastal',
    name: 'Coastal',
    description: 'Soft ocean blues and sandy tones for a relaxed, travel-inspired feel',
    preview: {
      headerBg: '#f0f9ff',
      heroBg: '#0c4a6e',
      heroText: '#f0f9ff',
      cardBg: '#f0f9ff',
      accent: '#0ea5e9',
      bodyBg: '#f0f9ff',
    },
  },
  {
    id: 'blacklane',
    name: 'Blacklane',
    description: 'Cinematic all-black luxury chauffeur aesthetic with serif italic headlines and electric blue accents',
    preview: {
      headerBg: '#0a0a0a',
      heroBg: '#000000',
      heroText: '#ffffff',
      cardBg: '#141414',
      accent: '#0066ff',
      bodyBg: '#0a0a0a',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm coral and amber palette evoking golden-hour Mediterranean coastlines',
    preview: {
      headerBg: '#7c2d12',
      heroBg: '#7c2d12',
      heroText: '#fff7ed',
      cardBg: '#ffffff',
      accent: '#f97316',
      bodyBg: '#fff7ed',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep emerald and warm cream tones for an organic, nature-inspired retreat feel',
    preview: {
      headerBg: '#064e3b',
      heroBg: '#064e3b',
      heroText: '#ecfdf5',
      cardBg: '#ffffff',
      accent: '#059669',
      bodyBg: '#f7faf7',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark indigo and violet aesthetic with vibrant purple accents — premium nightlife & VIP feel',
    preview: {
      headerBg: '#0f0a24',
      heroBg: '#1a103a',
      heroText: '#ffffff',
      cardBg: '#1c1640',
      accent: '#a855f7',
      bodyBg: '#0f0a24',
    },
  },
];

export const getTemplateConfig = (id: StorefrontTemplate): TemplateConfig => {
  return STOREFRONT_TEMPLATES.find((t) => t.id === id) ?? STOREFRONT_TEMPLATES[0];
};
