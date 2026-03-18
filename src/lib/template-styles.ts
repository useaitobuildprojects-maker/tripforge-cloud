import { StorefrontTemplate } from '@/types/agency';

export interface TemplateStyles {
  headerClass: string;
  footerClass: string;
  bodyClass: string;
  heroClass: string;
  heroOverlayClass: string;
  heroTitleClass: string;
  heroSubtitleClass: string;
  cardClass: string;
  cardHoverClass: string;
  sectionAltClass: string;
  primaryBtnClass: string;
  testimonialHighlightClass: string;
  testimonialNormalClass: string;
  searchBarClass: string;
  iconBgClass: string;
  subHeroClass: string;
}

const classicStyles: TemplateStyles = {
  headerClass: 'bg-white border-b border-gray-200 shadow-sm',
  footerClass: 'bg-gray-50 border-t border-gray-200 text-gray-900',
  bodyClass: 'bg-white',
  heroClass: 'bg-primary',
  heroOverlayClass: 'bg-gradient-to-br from-primary via-primary/95 to-primary/80',
  heroTitleClass: 'text-white',
  heroSubtitleClass: 'text-white/60',
  cardClass: 'bg-white border border-gray-100 rounded-xl shadow-sm',
  cardHoverClass: 'hover:shadow-lg',
  sectionAltClass: 'bg-gray-50',
  primaryBtnClass: '', // will use custom colors
  testimonialHighlightClass: 'bg-primary text-white border-primary',
  testimonialNormalClass: 'bg-white border-gray-100',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-100',
  iconBgClass: 'bg-primary/5 text-primary',
  subHeroClass: 'bg-primary/5',
};

const minimalStyles: TemplateStyles = {
  headerClass: 'bg-white border-b border-gray-100',
  footerClass: 'bg-white border-t border-gray-100 text-gray-900',
  bodyClass: 'bg-white',
  heroClass: 'bg-slate-50',
  heroOverlayClass: '',
  heroTitleClass: 'text-slate-900',
  heroSubtitleClass: 'text-slate-500',
  cardClass: 'bg-white border border-gray-100 rounded-xl',
  cardHoverClass: 'hover:shadow-md hover:border-gray-200',
  sectionAltClass: 'bg-slate-50',
  primaryBtnClass: '',
  testimonialHighlightClass: 'bg-slate-100 text-slate-900 border-slate-200',
  testimonialNormalClass: 'bg-white border-gray-100',
  searchBarClass: 'bg-white rounded-2xl shadow-lg border border-gray-100',
  iconBgClass: 'bg-slate-100 text-slate-700',
  subHeroClass: 'bg-slate-50',
};

const elegantStyles: TemplateStyles = {
  headerClass: 'bg-[#faf8f5] border-b border-[#e8ddd0]',
  footerClass: 'bg-[#f5f0eb] border-t border-[#e8ddd0] text-[#2c1810]',
  bodyClass: 'bg-[#f5f0eb]',
  heroClass: 'bg-[#2c1810]',
  heroOverlayClass: 'bg-gradient-to-br from-[#2c1810] via-[#3d2316] to-[#4a2c1a]',
  heroTitleClass: 'text-[#faf8f5] font-serif',
  heroSubtitleClass: 'text-[#faf8f5]/50',
  cardClass: 'bg-[#faf8f5] border border-[#e8ddd0] rounded-xl',
  cardHoverClass: 'hover:shadow-lg',
  sectionAltClass: 'bg-[#f0e8de]',
  primaryBtnClass: '',
  testimonialHighlightClass: 'bg-[#2c1810] text-[#faf8f5] border-[#4a2c1a]',
  testimonialNormalClass: 'bg-[#faf8f5] border-[#e8ddd0]',
  searchBarClass: 'bg-[#faf8f5] rounded-2xl shadow-xl border border-[#e8ddd0]',
  iconBgClass: 'bg-[#b8860b]/10 text-[#b8860b]',
  subHeroClass: 'bg-[#2c1810]/5',
};

const STYLE_MAP: Record<StorefrontTemplate, TemplateStyles> = {
  classic: classicStyles,
  minimal: minimalStyles,
  elegant: elegantStyles,
};

export const getTemplateStyles = (template: StorefrontTemplate): TemplateStyles => {
  return STYLE_MAP[template] ?? classicStyles;
};
