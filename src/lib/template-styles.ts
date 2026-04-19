import { StorefrontTemplate } from '@/types/agency';

export interface SurfaceTokens {
  // Page surfaces
  surface: React.CSSProperties;          // primary card / "white" surface
  surfaceAlt: React.CSSProperties;       // alternate section bg ("gray-50")
  surfaceDeep: React.CSSProperties;      // deepest contrast section ("gray-950" CTA bands)
  // Text
  textPrimary: React.CSSProperties;      // headings ("gray-900")
  textBody: React.CSSProperties;         // body ("gray-600/500")
  textMuted: React.CSSProperties;        // labels ("gray-400")
  textFaint: React.CSSProperties;        // hints ("gray-300")
  textOnDeep: React.CSSProperties;       // text on surfaceDeep
  textOnDeepMuted: React.CSSProperties;  // muted text on surfaceDeep
  // Lines & overlays
  border: React.CSSProperties;           // ("border-gray-100/200")
  divider: React.CSSProperties;          // background:color (for w-px dividers)
  // Form input
  inputSurface: React.CSSProperties;
  inputBorder: React.CSSProperties;
}

export interface TemplateStyles {
  headerClass: string;
  headerStyle?: React.CSSProperties;
  footerClass: string;
  footerStyle?: React.CSSProperties;
  bodyClass: string;
  bodyStyle?: React.CSSProperties;
  heroClass: string;
  heroStyle?: React.CSSProperties;
  heroOverlayClass: string;
  heroOverlayStyle?: React.CSSProperties;
  heroTitleClass: string;
  heroTitleStyle?: React.CSSProperties;
  heroSubtitleClass: string;
  heroSubtitleStyle?: React.CSSProperties;
  cardClass: string;
  cardStyle?: React.CSSProperties;
  cardHoverClass: string;
  sectionAltClass: string;
  sectionAltStyle?: React.CSSProperties;
  primaryBtnClass: string;
  testimonialHighlightClass: string;
  testimonialHighlightStyle?: React.CSSProperties;
  testimonialNormalClass: string;
  testimonialNormalStyle?: React.CSSProperties;
  searchBarClass: string;
  searchBarStyle?: React.CSSProperties;
  iconBgClass: string;
  iconBgStyle?: React.CSSProperties;
  subHeroClass: string;
  /** Whether template renders on a dark canvas (controls SVG curve fill etc.) */
  isDark: boolean;
  /** Solid color matching `surface` background — used by SVG <path fill> joints. */
  surfaceFill: string;
  /** Solid color matching `surfaceDeep` — used for hero/CTA band backgrounds. */
  surfaceDeepFill: string;
  /** Token-based surfaces for page content. */
  tokens: SurfaceTokens;
}

// ─────────────────────────────────────────────────────────────────
// LIGHT defaults (classic / minimal / fresh / coastal / corporate / elegant)
// ─────────────────────────────────────────────────────────────────
const lightTokens: SurfaceTokens = {
  surface: { backgroundColor: '#ffffff' },
  surfaceAlt: { backgroundColor: '#f9fafb' },
  surfaceDeep: { backgroundColor: '#0a0a0a', color: '#ffffff' },
  textPrimary: { color: '#111827' },
  textBody: { color: '#6b7280' },
  textMuted: { color: '#9ca3af' },
  textFaint: { color: '#d1d5db' },
  textOnDeep: { color: '#ffffff' },
  textOnDeepMuted: { color: 'rgba(255,255,255,0.4)' },
  border: { borderColor: '#f3f4f6' },
  divider: { backgroundColor: '#e5e7eb' },
  inputSurface: { backgroundColor: '#ffffff' },
  inputBorder: { borderColor: '#e5e7eb' },
};

// ─────────────────────────────────────────────────────────────────
// DARK tokens (blacklane)
// ─────────────────────────────────────────────────────────────────
const darkTokens: SurfaceTokens = {
  surface: { backgroundColor: '#0a0a0a', color: '#ffffff' },
  surfaceAlt: { backgroundColor: '#111111', color: '#ffffff' },
  surfaceDeep: { backgroundColor: '#000000', color: '#ffffff' },
  textPrimary: { color: '#ffffff' },
  textBody: { color: 'rgba(255,255,255,0.7)' },
  textMuted: { color: 'rgba(255,255,255,0.45)' },
  textFaint: { color: 'rgba(255,255,255,0.25)' },
  textOnDeep: { color: '#ffffff' },
  textOnDeepMuted: { color: 'rgba(255,255,255,0.5)' },
  border: { borderColor: 'rgba(255,255,255,0.08)' },
  divider: { backgroundColor: 'rgba(255,255,255,0.1)' },
  inputSurface: { backgroundColor: '#1a1a1a', color: '#ffffff' },
  inputBorder: { borderColor: 'rgba(255,255,255,0.12)' },
};

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
  primaryBtnClass: '',
  testimonialHighlightClass: 'bg-primary text-white border-primary',
  testimonialNormalClass: 'bg-white border-gray-100',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-100',
  iconBgClass: 'bg-primary/5 text-primary',
  subHeroClass: 'bg-primary/5',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: '#0a0a0a',
  tokens: lightTokens,
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
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: '#0a0a0a',
  tokens: lightTokens,
};

const elegantStyles: TemplateStyles = {
  headerClass: 'border-b shadow-sm',
  headerStyle: { backgroundColor: '#faf8f5', borderColor: '#e0d3c3' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#2c1810', borderColor: '#3d2316', color: '#faf8f5' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#f5f0eb' },
  heroClass: '',
  heroStyle: { backgroundColor: '#2c1810' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(to bottom right, #1a0e08, #2c1810, #3d2316)' },
  heroTitleClass: 'font-serif',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: '#d4c5b3' },
  cardClass: 'rounded-xl shadow-sm',
  cardStyle: { backgroundColor: '#faf8f5', borderWidth: '1px', borderColor: '#e0d3c3' },
  cardHoverClass: 'hover:shadow-lg',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#efe6d8' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-2xl',
  testimonialHighlightStyle: { backgroundColor: '#2c1810', color: '#faf8f5', borderColor: '#3d2316' },
  testimonialNormalClass: 'rounded-2xl',
  testimonialNormalStyle: { backgroundColor: '#faf8f5', borderColor: '#e0d3c3' },
  searchBarClass: 'rounded-2xl shadow-xl',
  searchBarStyle: { backgroundColor: '#faf8f5', borderWidth: '1px', borderColor: '#e0d3c3' },
  iconBgClass: '',
  iconBgStyle: { backgroundColor: 'rgba(200, 169, 81, 0.15)', color: '#b8860b' },
  subHeroClass: '',
  isDark: false,
  surfaceFill: '#faf8f5',
  surfaceDeepFill: '#2c1810',
  tokens: {
    ...lightTokens,
    surface: { backgroundColor: '#faf8f5' },
    surfaceAlt: { backgroundColor: '#efe6d8' },
    surfaceDeep: { backgroundColor: '#2c1810', color: '#faf8f5' },
    textPrimary: { color: '#2c1810' },
    textBody: { color: '#6b5a48' },
    textMuted: { color: '#a08c75' },
    border: { borderColor: '#e0d3c3' },
    divider: { backgroundColor: '#e0d3c3' },
  },
};

const corporateStyles: TemplateStyles = {
  headerClass: 'border-b',
  headerStyle: { backgroundColor: '#1e3a5f', borderColor: '#2d4a6f', color: '#ffffff' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#1e3a5f', borderColor: '#2d4a6f', color: '#ffffff' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#f8fafc' },
  heroClass: '',
  heroStyle: { backgroundColor: '#1e3a5f' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(to bottom right, #1e3a5f, #254b75, #1e3a5f)' },
  heroTitleClass: '',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.5)' },
  cardClass: 'bg-white border border-gray-200 rounded-xl shadow-sm',
  cardHoverClass: 'hover:shadow-lg hover:border-blue-200',
  sectionAltClass: 'bg-blue-50/50',
  primaryBtnClass: '',
  testimonialHighlightClass: '',
  testimonialHighlightStyle: { backgroundColor: '#1e3a5f', color: '#ffffff', borderColor: '#2d4a6f' },
  testimonialNormalClass: 'bg-white border-gray-200',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-200',
  iconBgClass: 'bg-blue-50',
  iconBgStyle: { color: '#1e3a5f' },
  subHeroClass: 'bg-blue-50/50',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: '#1e3a5f',
  tokens: lightTokens,
};

const freshStyles: TemplateStyles = {
  headerClass: 'bg-white border-b border-green-100',
  footerClass: 'bg-green-50 border-t border-green-100 text-green-900',
  bodyClass: '',
  bodyStyle: { backgroundColor: '#fafffe' },
  heroClass: 'bg-green-50',
  heroOverlayClass: '',
  heroTitleClass: 'text-green-900',
  heroSubtitleClass: 'text-green-700/60',
  cardClass: 'bg-white border border-green-100 rounded-xl',
  cardHoverClass: 'hover:shadow-md hover:border-green-200',
  sectionAltClass: 'bg-green-50/60',
  primaryBtnClass: '',
  testimonialHighlightClass: 'bg-green-600 text-white border-green-600',
  testimonialNormalClass: 'bg-white border-green-100',
  searchBarClass: 'bg-white rounded-2xl shadow-lg border border-green-100',
  iconBgClass: 'bg-green-50 text-green-700',
  subHeroClass: 'bg-green-50/60',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: '#14532d',
  tokens: lightTokens,
};

const coastalStyles: TemplateStyles = {
  headerClass: 'border-b border-sky-200',
  headerStyle: { backgroundColor: '#f0f9ff' },
  footerClass: 'border-t border-sky-800',
  footerStyle: { backgroundColor: '#0c4a6e', color: '#e0f2fe' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#f0f9ff' },
  heroClass: '',
  heroStyle: { backgroundColor: '#0c4a6e' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(to bottom right, #0c4a6e, #0e5a85, #0369a1)' },
  heroTitleClass: '',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(186, 230, 253, 0.6)' },
  cardClass: 'bg-white border border-sky-100 rounded-xl',
  cardHoverClass: 'hover:shadow-md hover:border-sky-200',
  sectionAltClass: 'bg-sky-50',
  primaryBtnClass: '',
  testimonialHighlightClass: '',
  testimonialHighlightStyle: { backgroundColor: '#0c4a6e', color: '#ffffff', borderColor: '#075985' },
  testimonialNormalClass: 'bg-white border-sky-100',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-sky-100',
  iconBgClass: 'bg-sky-50 text-sky-700',
  subHeroClass: 'bg-sky-50',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: '#0c4a6e',
  tokens: lightTokens,
};

const blacklaneStyles: TemplateStyles = {
  headerClass: 'border-b',
  headerStyle: { backgroundColor: '#0a0a0a', borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#000000', borderColor: 'rgba(255,255,255,0.06)', color: '#ffffff' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#0a0a0a', color: '#ffffff' },
  heroClass: '',
  heroStyle: { backgroundColor: '#000000' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.85) 100%)' },
  heroTitleClass: 'font-serif italic tracking-tight',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.75)' },
  cardClass: 'rounded-2xl',
  cardStyle: { backgroundColor: '#141414', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' },
  cardHoverClass: 'hover:border-white/20',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#111111' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-2xl',
  testimonialHighlightStyle: { backgroundColor: '#0066ff', color: '#ffffff', borderColor: '#0066ff' },
  testimonialNormalClass: 'rounded-2xl',
  testimonialNormalStyle: { backgroundColor: '#141414', borderColor: 'rgba(255,255,255,0.08)', color: '#ffffff' },
  searchBarClass: 'rounded-2xl shadow-2xl',
  searchBarStyle: { backgroundColor: 'rgba(20,20,20,0.92)', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' },
  iconBgClass: '',
  iconBgStyle: { backgroundColor: 'rgba(0,102,255,0.12)', color: '#3b82f6' },
  subHeroClass: '',
  isDark: true,
  surfaceFill: '#0a0a0a',
  surfaceDeepFill: '#000000',
  tokens: darkTokens,
};

const STYLE_MAP: Record<StorefrontTemplate, TemplateStyles> = {
  classic: classicStyles,
  minimal: minimalStyles,
  elegant: elegantStyles,
  corporate: corporateStyles,
  fresh: freshStyles,
  coastal: coastalStyles,
  blacklane: blacklaneStyles,
};

export const getTemplateStyles = (template: StorefrontTemplate): TemplateStyles => {
  return STYLE_MAP[template] ?? classicStyles;
};
