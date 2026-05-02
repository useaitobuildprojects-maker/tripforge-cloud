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

/** Per-template accent palette consumed by the storefront header, hero & CTAs. */
export interface TemplatePalette {
  /** Main brand accent (links, icons, secondary CTAs). */
  brand: string;
  /** Deeper brand shade (header bg, hero bg, CTA bands). */
  brandDeep: string;
  /** Soft tint of the brand for chip/info backgrounds. */
  brandSoftBg: string;
  /** Conversion CTA fill. */
  cta: string;
  ctaHover: string;
  /** Text color used on top of `cta`. */
  ctaText: string;
  /** Text color used on top of `brandDeep` (header). */
  onBrandDeep: string;
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
  /** Accent palette driving header / hero / CTA colors. */
  palette: TemplatePalette;
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

// Shared light-template factory. Each template passes its own `palette` so the
// header / hero / CTAs visually distinguish it from siblings.
const makeLightTemplate = (
  palette: TemplatePalette,
  overrides: Partial<TemplateStyles> = {},
): TemplateStyles => ({
  headerClass: 'bg-white border-b border-gray-200',
  footerClass: 'bg-white border-t border-gray-200 text-gray-900',
  bodyClass: 'bg-white',
  heroClass: '',
  heroStyle: { backgroundColor: palette.brandDeep },
  heroOverlayClass: '',
  heroOverlayStyle: { background: `linear-gradient(135deg, ${palette.brandDeep} 0%, ${palette.brand} 100%)` },
  heroTitleClass: 'tracking-tight',
  heroTitleStyle: { color: palette.onBrandDeep },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.85)' },
  cardClass: 'bg-white border border-gray-200 rounded-2xl shadow-sm',
  cardHoverClass: 'hover:shadow-lg hover:-translate-y-0.5 transition-all',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#f7f9fc' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-2xl',
  testimonialHighlightStyle: { backgroundColor: palette.brand, color: '#ffffff', borderColor: palette.brand },
  testimonialNormalClass: 'bg-white border-gray-200 rounded-2xl',
  searchBarClass: 'bg-white rounded-2xl shadow-xl border border-gray-200',
  iconBgClass: '',
  iconBgStyle: { backgroundColor: palette.brandSoftBg, color: palette.brand },
  subHeroClass: '',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: palette.brandDeep,
  tokens: lightTokens,
  palette,
  ...overrides,
});

// ─── Per-template palettes (match preview swatches in storefront-templates.ts) ───
const classicPalette: TemplatePalette = {
  brand: '#c8a951', brandDeep: '#1a1f36', brandSoftBg: '#f5efdc',
  cta: '#c8a951', ctaHover: '#b3954a', ctaText: '#1a1f36', onBrandDeep: '#ffffff',
};
const minimalPalette: TemplatePalette = {
  brand: '#3b82f6', brandDeep: '#1e293b', brandSoftBg: '#eff6ff',
  cta: '#3b82f6', ctaHover: '#2563eb', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};
const elegantPalette: TemplatePalette = {
  brand: '#b8860b', brandDeep: '#2c1810', brandSoftBg: '#faf3e0',
  cta: '#b8860b', ctaHover: '#9c7209', ctaText: '#ffffff', onBrandDeep: '#faf8f5',
};
const corporatePalette: TemplatePalette = {
  brand: '#2563eb', brandDeep: '#1e3a5f', brandSoftBg: '#dbeafe',
  cta: '#2563eb', ctaHover: '#1d4ed8', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};
const freshPalette: TemplatePalette = {
  brand: '#16a34a', brandDeep: '#14532d', brandSoftBg: '#dcfce7',
  cta: '#16a34a', ctaHover: '#15803d', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};
const coastalPalette: TemplatePalette = {
  brand: '#0ea5e9', brandDeep: '#0c4a6e', brandSoftBg: '#e0f2fe',
  cta: '#0ea5e9', ctaHover: '#0284c7', ctaText: '#ffffff', onBrandDeep: '#f0f9ff',
};
const blacklanePalette: TemplatePalette = {
  brand: '#0066ff', brandDeep: '#000000', brandSoftBg: 'rgba(0,102,255,0.12)',
  cta: '#0066ff', ctaHover: '#0052cc', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};
const sunsetPalette: TemplatePalette = {
  brand: '#f97316', brandDeep: '#7c2d12', brandSoftBg: '#ffedd5',
  cta: '#f97316', ctaHover: '#ea580c', ctaText: '#ffffff', onBrandDeep: '#fff7ed',
};
const forestPalette: TemplatePalette = {
  brand: '#059669', brandDeep: '#064e3b', brandSoftBg: '#d1fae5',
  cta: '#059669', ctaHover: '#047857', ctaText: '#ffffff', onBrandDeep: '#ecfdf5',
};
const midnightPalette: TemplatePalette = {
  brand: '#a855f7', brandDeep: '#0f0a24', brandSoftBg: 'rgba(168,85,247,0.14)',
  cta: '#a855f7', ctaHover: '#9333ea', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};

const classicStyles = makeLightTemplate(classicPalette, {
  sectionAltStyle: { backgroundColor: '#f9fafb' },
});
const minimalStyles = makeLightTemplate(minimalPalette, {
  heroStyle: { backgroundColor: '#f1f5f9' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
  heroTitleStyle: { color: '#1e293b' },
  heroSubtitleStyle: { color: '#475569' },
  surfaceDeepFill: '#1e293b',
});
const elegantStyles = makeLightTemplate(elegantPalette, {
  bodyClass: '',
  bodyStyle: { backgroundColor: '#f5f0eb' },
  sectionAltStyle: { backgroundColor: '#faf3e0' },
});
const corporateStyles = makeLightTemplate(corporatePalette, {
  sectionAltStyle: { backgroundColor: '#f8fafc' },
});
const freshStyles = makeLightTemplate(freshPalette, {
  bodyStyle: { backgroundColor: '#fafffe' },
  sectionAltStyle: { backgroundColor: '#f0fdf4' },
});
const coastalStyles = makeLightTemplate(coastalPalette, {
  bodyStyle: { backgroundColor: '#f0f9ff' },
  sectionAltStyle: { backgroundColor: '#e0f2fe' },
});
const sunsetStyles = makeLightTemplate(sunsetPalette, {
  bodyStyle: { backgroundColor: '#fff7ed' },
  sectionAltStyle: { backgroundColor: '#ffedd5' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)' },
});
const forestStyles = makeLightTemplate(forestPalette, {
  bodyStyle: { backgroundColor: '#f7faf7' },
  sectionAltStyle: { backgroundColor: '#ecfdf5' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
});

const midnightStyles: TemplateStyles = {
  headerClass: 'border-b',
  headerStyle: { backgroundColor: '#0f0a24', borderColor: 'rgba(168,85,247,0.18)', color: '#ffffff' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#0a0719', borderColor: 'rgba(168,85,247,0.18)', color: '#ffffff' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#0f0a24', color: '#ffffff' },
  heroClass: '',
  heroStyle: { backgroundColor: '#1a103a' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(135deg, #1a103a 0%, #4c1d95 60%, #a855f7 100%)' },
  heroTitleClass: 'tracking-tight',
  heroTitleStyle: { color: '#ffffff' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.78)' },
  cardClass: 'rounded-2xl',
  cardStyle: { backgroundColor: '#1c1640', borderWidth: '1px', borderColor: 'rgba(168,85,247,0.18)', color: '#ffffff' },
  cardHoverClass: 'hover:border-purple-400/40',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#15102e' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-2xl',
  testimonialHighlightStyle: { backgroundColor: '#a855f7', color: '#ffffff', borderColor: '#a855f7' },
  testimonialNormalClass: 'rounded-2xl',
  testimonialNormalStyle: { backgroundColor: '#1c1640', borderColor: 'rgba(168,85,247,0.18)', color: '#ffffff' },
  searchBarClass: 'rounded-2xl shadow-2xl',
  searchBarStyle: { backgroundColor: 'rgba(28,22,64,0.92)', borderWidth: '1px', borderColor: 'rgba(168,85,247,0.25)', backdropFilter: 'blur(12px)' },
  iconBgClass: '',
  iconBgStyle: { backgroundColor: 'rgba(168,85,247,0.16)', color: '#c084fc' },
  subHeroClass: '',
  isDark: true,
  surfaceFill: '#0f0a24',
  surfaceDeepFill: '#1a103a',
  tokens: darkTokens,
  palette: midnightPalette,
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
  palette: blacklanePalette,
};

const STYLE_MAP: Record<StorefrontTemplate, TemplateStyles> = {
  classic: classicStyles,
  minimal: minimalStyles,
  elegant: elegantStyles,
  corporate: corporateStyles,
  fresh: freshStyles,
  coastal: coastalStyles,
  blacklane: blacklaneStyles,
  sunset: sunsetStyles,
  forest: forestStyles,
  midnight: midnightStyles,
};

export const getTemplateStyles = (template: StorefrontTemplate): TemplateStyles => {
  return STYLE_MAP[template] ?? classicStyles;
};
