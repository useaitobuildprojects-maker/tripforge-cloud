import { StorefrontTemplate } from '@/types/agency';

export interface TemplateStyles {
  // Layout
  headerClass: string;
  footerClass: string;
  bodyClass: string;
  // Hero
  heroClass: string;
  heroOverlayClass: string;
  heroTitleClass: string;
  heroSubtitleClass: string;
  // Cards
  cardClass: string;
  cardHoverClass: string;
  // Sections
  sectionAltClass: string;
  // Buttons
  primaryBtnClass: string;
  // Testimonials
  testimonialHighlightClass: string;
  testimonialNormalClass: string;
  // General
  searchBarClass: string;
  iconBgClass: string;
  // Sub-page hero
  subHeroClass: string;
}

const classicStyles: TemplateStyles = {
  headerClass: 'bg-background border-b border-border shadow-sm',
  footerClass: 'bg-card border-t border-border text-foreground',
  bodyClass: 'bg-background',
  heroClass: 'bg-primary',
  heroOverlayClass: 'bg-gradient-to-br from-primary via-primary/95 to-primary/80',
  heroTitleClass: 'text-white',
  heroSubtitleClass: 'text-white/60',
  cardClass: 'bg-white border border-gray-100 rounded-xl shadow-sm',
  cardHoverClass: 'hover:shadow-lg',
  sectionAltClass: 'bg-gray-50',
  primaryBtnClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
  testimonialHighlightClass: 'bg-primary text-white border-primary',
  testimonialNormalClass: 'bg-white border-gray-100',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-100',
  iconBgClass: 'bg-primary/5 text-primary',
  subHeroClass: 'bg-primary/5',
};

const modernDarkStyles: TemplateStyles = {
  headerClass: 'bg-[#0f0f14] border-b border-white/10',
  footerClass: 'bg-[#0a0a0f] border-t border-white/10 text-white',
  bodyClass: 'bg-[#0f0f14] text-white',
  heroClass: 'bg-gradient-to-br from-[#0f0f14] via-[#1a1a2e] to-[#16213e]',
  heroOverlayClass: '',
  heroTitleClass: 'text-white',
  heroSubtitleClass: 'text-white/50',
  cardClass: 'bg-[#1a1a24] border border-white/10 rounded-xl backdrop-blur-sm',
  cardHoverClass: 'hover:border-indigo-500/40 hover:shadow-[0_0_30px_rgba(99,102,241,0.1)]',
  sectionAltClass: 'bg-[#0a0a0f]',
  primaryBtnClass: 'bg-indigo-600 text-white hover:bg-indigo-500',
  testimonialHighlightClass: 'bg-indigo-600/20 text-white border-indigo-500/30',
  testimonialNormalClass: 'bg-[#1a1a24] border-white/10',
  searchBarClass: 'bg-[#1a1a24] rounded-2xl shadow-2xl border border-white/10 backdrop-blur-sm',
  iconBgClass: 'bg-indigo-500/10 text-indigo-400',
  subHeroClass: 'bg-[#1a1a2e]',
};

const elegantStyles: TemplateStyles = {
  headerClass: 'bg-[#faf8f5] border-b border-[#e8ddd0]',
  footerClass: 'bg-[#2c1810] border-t border-[#4a2c1a] text-[#faf8f5]',
  bodyClass: 'bg-[#f5f0eb]',
  heroClass: 'bg-[#2c1810]',
  heroOverlayClass: 'bg-gradient-to-br from-[#2c1810] via-[#3d2316] to-[#4a2c1a]',
  heroTitleClass: 'text-[#faf8f5] font-serif',
  heroSubtitleClass: 'text-[#faf8f5]/50',
  cardClass: 'bg-[#faf8f5] border border-[#e8ddd0] rounded-xl',
  cardHoverClass: 'hover:shadow-lg hover:border-[#b8860b]/30',
  sectionAltClass: 'bg-[#f0e8de]',
  primaryBtnClass: 'bg-[#b8860b] text-white hover:bg-[#a07608]',
  testimonialHighlightClass: 'bg-[#2c1810] text-[#faf8f5] border-[#4a2c1a]',
  testimonialNormalClass: 'bg-[#faf8f5] border-[#e8ddd0]',
  searchBarClass: 'bg-[#faf8f5] rounded-2xl shadow-xl border border-[#e8ddd0]',
  iconBgClass: 'bg-[#b8860b]/10 text-[#b8860b]',
  subHeroClass: 'bg-[#2c1810]/5',
};

const STYLE_MAP: Record<StorefrontTemplate, TemplateStyles> = {
  classic: classicStyles,
  'modern-dark': modernDarkStyles,
  elegant: elegantStyles,
};

export const getTemplateStyles = (template: StorefrontTemplate): TemplateStyles => {
  return STYLE_MAP[template] ?? classicStyles;
};
