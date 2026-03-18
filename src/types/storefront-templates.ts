export type StorefrontTemplate = 'classic' | 'modern-dark' | 'elegant';

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
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Bold dark theme with neon accents and glass-morphism effects',
    preview: {
      headerBg: '#0f0f14',
      heroBg: '#0f0f14',
      heroText: '#ffffff',
      cardBg: '#1a1a24',
      accent: '#6366f1',
      bodyBg: '#0f0f14',
    },
  },
  {
    id: 'elegant',
    name: 'Elegant',
    description: 'Warm tones with serif typography and luxury hospitality feel',
    preview: {
      headerBg: '#faf8f5',
      heroBg: '#2c1810',
      heroText: '#faf8f5',
      cardBg: '#faf8f5',
      accent: '#b8860b',
      bodyBg: '#f5f0eb',
    },
  },
];

export const getTemplateConfig = (id: StorefrontTemplate): TemplateConfig => {
  return STOREFRONT_TEMPLATES.find((t) => t.id === id) ?? STOREFRONT_TEMPLATES[0];
};
