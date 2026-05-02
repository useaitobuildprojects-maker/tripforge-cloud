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
  | 'midnight'
  | 'monochrome'
  | 'rosegold'
  | 'desert'
  | 'arctic'
  | 'royal'
  | 'cyberpunk'
  | 'vintage'
  | 'lavender'
  | 'noir'
  | 'tropical';

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
  {
    id: 'monochrome',
    name: 'Monochrome',
    description: 'Pure black & white editorial design with razor-sharp typography',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#000000',
      heroText: '#ffffff',
      cardBg: '#ffffff',
      accent: '#000000',
      bodyBg: '#ffffff',
    },
  },
  {
    id: 'rosegold',
    name: 'Rose Gold',
    description: 'Soft blush pinks with metallic rose gold accents — feminine luxury',
    preview: {
      headerBg: '#fdf2f8',
      heroBg: '#831843',
      heroText: '#fdf2f8',
      cardBg: '#ffffff',
      accent: '#e11d48',
      bodyBg: '#fff1f2',
    },
  },
  {
    id: 'desert',
    name: 'Desert',
    description: 'Warm terracotta and sand tones inspired by Moroccan riads',
    preview: {
      headerBg: '#fef3c7',
      heroBg: '#92400e',
      heroText: '#fffbeb',
      cardBg: '#fffbeb',
      accent: '#d97706',
      bodyBg: '#fffbeb',
    },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Crisp icy blues and pristine whites — clean Scandinavian minimalism',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#e0f2fe',
      heroText: '#0c4a6e',
      cardBg: '#ffffff',
      accent: '#06b6d4',
      bodyBg: '#f0f9ff',
    },
  },
  {
    id: 'royal',
    name: 'Royal',
    description: 'Deep regal purple with gold accents — opulent palace aesthetic',
    preview: {
      headerBg: '#3b0764',
      heroBg: '#3b0764',
      heroText: '#fef3c7',
      cardBg: '#ffffff',
      accent: '#eab308',
      bodyBg: '#faf5ff',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Neon magenta and electric cyan on jet black — futuristic tech aesthetic',
    preview: {
      headerBg: '#0a0014',
      heroBg: '#0a0014',
      heroText: '#f0abfc',
      cardBg: '#170028',
      accent: '#ec4899',
      bodyBg: '#0a0014',
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    description: 'Aged paper cream with deep burgundy — old-world travel poster charm',
    preview: {
      headerBg: '#fef6e4',
      heroBg: '#7f1d1d',
      heroText: '#fef6e4',
      cardBg: '#fef6e4',
      accent: '#991b1b',
      bodyBg: '#fbf5e6',
    },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft lavender and lilac pastels for a calming, gentle ambience',
    preview: {
      headerBg: '#faf5ff',
      heroBg: '#6b21a8',
      heroText: '#faf5ff',
      cardBg: '#ffffff',
      accent: '#8b5cf6',
      bodyBg: '#faf5ff',
    },
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Deep charcoal with crimson red — moody film-noir cinematic feel',
    preview: {
      headerBg: '#18181b',
      heroBg: '#09090b',
      heroText: '#fafafa',
      cardBg: '#27272a',
      accent: '#dc2626',
      bodyBg: '#18181b',
    },
  },
  {
    id: 'tropical',
    name: 'Tropical',
    description: 'Vibrant teal and sunny yellow — Caribbean island vacation vibes',
    preview: {
      headerBg: '#ffffff',
      heroBg: '#115e59',
      heroText: '#ecfeff',
      cardBg: '#ffffff',
      accent: '#14b8a6',
      bodyBg: '#f0fdfa',
    },
  },
];

export const getTemplateConfig = (id: StorefrontTemplate): TemplateConfig => {
  return STOREFRONT_TEMPLATES.find((t) => t.id === id) ?? STOREFRONT_TEMPLATES[0];
};
