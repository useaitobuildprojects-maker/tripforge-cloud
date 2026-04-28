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

/** Expedia-inspired accent palette — bright blue brand + yellow CTA. */
export const expediaPalette = {
  // Booking.com-inspired palette — deep navy-blue header & links, yellow conversion CTA
  brand: '#0071C2',          // Booking.com blue (links, accents)
  brandDeep: '#003580',      // dark navy used in headers, hero, CTA bands
  brandSoftBg: '#EBF3FF',    // very light blue tint for chip/info backgrounds
  cta: '#FEBB02',            // signature yellow CTA
  ctaHover: '#E8AB02',
  ctaText: '#1A1A1A',        // dark text on yellow
} as const;

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
  surfaceAlt: { backgroundColor: '#f7f9fc' },
  surfaceDeep: { backgroundColor: expediaPalette.brandDeep, color: '#ffffff' },
  textPrimary: { color: '#111827' },
  textBody: { color: '#4b5563' },
  textMuted: { color: '#6b7280' },
  textFaint: { color: '#d1d5db' },
  textOnDeep: { color: '#ffffff' },
  textOnDeepMuted: { color: 'rgba(255,255,255,0.75)' },
  border: { borderColor: '#e5e7eb' },
  divider: { backgroundColor: '#e5e7eb' },
  inputSurface: { backgroundColor: '#ffffff' },
  inputBorder: { borderColor: '#d1d5db' },
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

// Shared Expedia-style base for all light templates. Per-template variants only
// tweak accents (sectionAlt tint, iconBg, testimonial highlight) so the overall
// look stays consistent with the Expedia redesign.
const makeLightTemplate = (overrides: Partial<TemplateStyles> = {}): TemplateStyles => ({
  headerClass: 'bg-white border-b border-gray-200',
  footerClass: 'bg-white border-t border-gray-200 text-gray-900',
  bodyClass: 'bg-white',
  heroClass: '',
  heroStyle: { backgroundColor: expediaPalette.brandDeep },
  heroOverlayClass: '',
  heroOverlayStyle: { background: `linear-gradient(135deg, ${expediaPalette.brandDeep} 0%, ${expediaPalette.brand} 100%)` },
  heroTitleClass: 'tracking-tight',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.85)' },
  cardClass: 'bg-white border border-gray-200 rounded-2xl shadow-sm',
  cardHoverClass: 'hover:shadow-lg hover:-translate-y-0.5 transition-all',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#f7f9fc' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-2xl',
  testimonialHighlightStyle: { backgroundColor: expediaPalette.brand, color: '#ffffff', borderColor: expediaPalette.brand },
  testimonialNormalClass: 'bg-white border-gray-200 rounded-2xl',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-200',
  iconBgClass: '',
  iconBgStyle: { backgroundColor: expediaPalette.brandSoftBg, color: expediaPalette.brand },
  subHeroClass: '',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: expediaPalette.brandDeep,
  tokens: lightTokens,
  ...overrides,
});

const classicStyles = makeLightTemplate();
const minimalStyles = makeLightTemplate();
const elegantStyles = makeLightTemplate();
const corporateStyles = makeLightTemplate();
const freshStyles = makeLightTemplate();
const coastalStyles = makeLightTemplate();

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
