export type StorefrontTemplate = 'classic' | 'minimal' | 'elegant';

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
];

export const getTemplateConfig = (id: StorefrontTemplate): TemplateConfig => {
  return STOREFRONT_TEMPLATES.find((t) => t.id === id) ?? STOREFRONT_TEMPLATES[0];
};
