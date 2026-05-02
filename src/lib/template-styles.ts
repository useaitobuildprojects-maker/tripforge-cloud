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

/** Per-template typography pairing. Loaded globally via Google Fonts in index.html. */
export interface TemplateTypography {
  /** Font stack for hero / page headings. */
  heading: string;
  /** Font stack for body copy. */
  body: string;
  /** Tailwind class applied to the hero <h1> for case / weight / italic flavor. */
  headingClass: string;
}

/** Per-template shape language (radius + button feel). */
export interface TemplateShape {
  /** CSS radius for hero search bar, cards, modals. */
  cardRadius: string;
  /** CSS radius for buttons & input chips. */
  buttonRadius: string;
  /** Card shadow style. */
  cardShadow: string;
  /** Border weight on cards (e.g. '1px' or '2px'). */
  borderWidth: string;
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
  /** Font pairing for headings & body. */
  typography: TemplateTypography;
  /** Card / button radius & shadow language. */
  shape: TemplateShape;
}

// ─────────────────────────────────────────────────────────────────
// LIGHT defaults — surfaceDeep is palette-driven so each template's
// hero/CTA bands match its brand color (not a global Booking blue).
// ─────────────────────────────────────────────────────────────────
const makeLightTokens = (palette: TemplatePalette): SurfaceTokens => ({
  surface: { backgroundColor: '#ffffff' },
  surfaceAlt: { backgroundColor: '#f7f9fc' },
  surfaceDeep: { backgroundColor: palette.brandDeep, color: palette.onBrandDeep },
  textPrimary: { color: '#111827' },
  textBody: { color: '#4b5563' },
  textMuted: { color: '#6b7280' },
  textFaint: { color: '#d1d5db' },
  textOnDeep: { color: palette.onBrandDeep },
  textOnDeepMuted: { color: 'rgba(255,255,255,0.75)' },
  border: { borderColor: '#e5e7eb' },
  divider: { backgroundColor: '#e5e7eb' },
  inputSurface: { backgroundColor: '#ffffff' },
  inputBorder: { borderColor: '#d1d5db' },
});

// ─────────────────────────────────────────────────────────────────
// DARK tokens (blacklane)
// ─────────────────────────────────────────────────────────────────
const makeDarkTokens = (opts: {
  surface: string; surfaceAlt: string; surfaceDeep: string;
  input: string; border?: string; textBody?: string;
}): SurfaceTokens => ({
  surface: { backgroundColor: opts.surface, color: '#ffffff' },
  surfaceAlt: { backgroundColor: opts.surfaceAlt, color: '#ffffff' },
  surfaceDeep: { backgroundColor: opts.surfaceDeep, color: '#ffffff' },
  textPrimary: { color: '#ffffff' },
  textBody: { color: opts.textBody ?? 'rgba(255,255,255,0.78)' },
  textMuted: { color: 'rgba(255,255,255,0.6)' },
  textFaint: { color: 'rgba(255,255,255,0.35)' },
  textOnDeep: { color: '#ffffff' },
  textOnDeepMuted: { color: 'rgba(255,255,255,0.65)' },
  border: { borderColor: opts.border ?? 'rgba(255,255,255,0.12)' },
  divider: { backgroundColor: opts.border ?? 'rgba(255,255,255,0.14)' },
  inputSurface: { backgroundColor: opts.input, color: '#ffffff' },
  inputBorder: { borderColor: opts.border ?? 'rgba(255,255,255,0.18)' },
});
const blacklaneTokens = makeDarkTokens({
  surface: '#141414', surfaceAlt: '#1a1a1a', surfaceDeep: '#000000', input: '#1a1a1a',
});
const midnightTokens = makeDarkTokens({
  surface: '#1c1640', surfaceAlt: '#15102e', surfaceDeep: '#0f0a24',
  input: '#231a52', border: 'rgba(168,85,247,0.25)',
});
const cyberpunkTokens = makeDarkTokens({
  surface: '#170028', surfaceAlt: '#120020', surfaceDeep: '#0a0014',
  input: '#1f0035', border: 'rgba(236,72,153,0.32)',
  textBody: 'rgba(240,171,252,0.88)',
});
const noirTokens = makeDarkTokens({
  surface: '#27272a', surfaceAlt: '#1c1c1f', surfaceDeep: '#09090b', input: '#27272a',
});

// Shared light-template factory. Each template passes its own `palette` so the
// header / hero / CTAs visually distinguish it from siblings.
// ─── Default typography & shape (overridable per template) ───
const defaultTypography: TemplateTypography = {
  heading: '"Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-bold',
};
const defaultShape: TemplateShape = {
  cardRadius: '0.5rem',
  buttonRadius: '0.375rem',
  cardShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
  borderWidth: '1px',
};

const makeLightTemplate = (
  palette: TemplatePalette,
  overrides: Partial<TemplateStyles> = {},
  typography: TemplateTypography = defaultTypography,
  shape: TemplateShape = defaultShape,
): TemplateStyles => ({
  headerClass: 'bg-white border-b border-gray-200',
  footerClass: 'bg-white border-t border-gray-200 text-gray-900',
  bodyClass: 'bg-white',
  heroClass: '',
  heroStyle: { backgroundColor: palette.brandDeep },
  heroOverlayClass: '',
  heroOverlayStyle: { background: `linear-gradient(135deg, ${palette.brandDeep} 0%, ${palette.brand} 100%)` },
  heroTitleClass: typography.headingClass,
  heroTitleStyle: { color: palette.onBrandDeep },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(255,255,255,0.85)' },
  cardClass: 'bg-white border border-gray-200',
  cardHoverClass: 'hover:shadow-lg hover:-translate-y-0.5 transition-all',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#f7f9fc' },
  primaryBtnClass: '',
  testimonialHighlightClass: '',
  testimonialHighlightStyle: { backgroundColor: palette.brand, color: '#ffffff', borderColor: palette.brand },
  testimonialNormalClass: 'bg-white border-gray-200',
  searchBarClass: 'bg-white border border-gray-200',
  iconBgClass: '',
  iconBgStyle: { backgroundColor: palette.brandSoftBg, color: palette.brand },
  subHeroClass: '',
  isDark: false,
  surfaceFill: '#ffffff',
  surfaceDeepFill: palette.brandDeep,
  tokens: makeLightTokens(palette),
  palette,
  typography,
  shape,
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
const monochromePalette: TemplatePalette = {
  brand: '#000000', brandDeep: '#000000', brandSoftBg: '#f4f4f5',
  cta: '#000000', ctaHover: '#27272a', ctaText: '#ffffff', onBrandDeep: '#ffffff',
};
const rosegoldPalette: TemplatePalette = {
  brand: '#e11d48', brandDeep: '#831843', brandSoftBg: '#ffe4e6',
  cta: '#e11d48', ctaHover: '#be123c', ctaText: '#ffffff', onBrandDeep: '#fdf2f8',
};
const desertPalette: TemplatePalette = {
  brand: '#d97706', brandDeep: '#92400e', brandSoftBg: '#fef3c7',
  cta: '#d97706', ctaHover: '#b45309', ctaText: '#ffffff', onBrandDeep: '#fffbeb',
};
const arcticPalette: TemplatePalette = {
  brand: '#06b6d4', brandDeep: '#0c4a6e', brandSoftBg: '#cffafe',
  cta: '#06b6d4', ctaHover: '#0891b2', ctaText: '#ffffff', onBrandDeep: '#ecfeff',
};
const royalPalette: TemplatePalette = {
  brand: '#eab308', brandDeep: '#3b0764', brandSoftBg: '#f3e8ff',
  cta: '#eab308', ctaHover: '#ca8a04', ctaText: '#3b0764', onBrandDeep: '#fef3c7',
};
const cyberpunkPalette: TemplatePalette = {
  brand: '#ec4899', brandDeep: '#0a0014', brandSoftBg: 'rgba(236,72,153,0.14)',
  cta: '#ec4899', ctaHover: '#06b6d4', ctaText: '#ffffff', onBrandDeep: '#f0abfc',
};
const vintagePalette: TemplatePalette = {
  brand: '#991b1b', brandDeep: '#7f1d1d', brandSoftBg: '#fee2e2',
  cta: '#991b1b', ctaHover: '#7f1d1d', ctaText: '#fef6e4', onBrandDeep: '#fef6e4',
};
const lavenderPalette: TemplatePalette = {
  brand: '#8b5cf6', brandDeep: '#6b21a8', brandSoftBg: '#ede9fe',
  cta: '#8b5cf6', ctaHover: '#7c3aed', ctaText: '#ffffff', onBrandDeep: '#faf5ff',
};
const noirPalette: TemplatePalette = {
  brand: '#dc2626', brandDeep: '#09090b', brandSoftBg: 'rgba(220,38,38,0.14)',
  cta: '#dc2626', ctaHover: '#b91c1c', ctaText: '#ffffff', onBrandDeep: '#fafafa',
};
const tropicalPalette: TemplatePalette = {
  brand: '#14b8a6', brandDeep: '#115e59', brandSoftBg: '#ccfbf1',
  cta: '#facc15', ctaHover: '#eab308', ctaText: '#115e59', onBrandDeep: '#ecfeff',
};

const classicStyles = makeLightTemplate(classicPalette, {
  sectionAltStyle: { backgroundColor: '#f9fafb' },
}, {
  heading: '"Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-bold',
}, {
  cardRadius: '0.375rem',
  buttonRadius: '0.25rem',
  cardShadow: '0 4px 12px rgba(26,31,54,0.08)',
  borderWidth: '1px',
});
const minimalStyles = makeLightTemplate(minimalPalette, {
  heroStyle: { backgroundColor: '#f1f5f9' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' },
  heroTitleStyle: { color: '#1e293b' },
  heroSubtitleStyle: { color: '#475569' },
  surfaceDeepFill: '#1e293b',
}, {
  heading: '"Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-[-0.04em] font-extrabold',
}, {
  cardRadius: '0.25rem',
  buttonRadius: '0.25rem',
  cardShadow: 'none',
  borderWidth: '1px',
});
const elegantStyles = makeLightTemplate(elegantPalette, {
  bodyClass: '',
  bodyStyle: { backgroundColor: '#f5f0eb' },
  sectionAltStyle: { backgroundColor: '#faf3e0' },
}, {
  heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  body: '"Lora", Georgia, serif',
  headingClass: 'italic font-medium tracking-tight',
}, {
  cardRadius: '0.125rem',
  buttonRadius: '0.125rem',
  cardShadow: '0 8px 24px rgba(44,24,16,0.10)',
  borderWidth: '1px',
});
const corporateStyles = makeLightTemplate(corporatePalette, {
  sectionAltStyle: { backgroundColor: '#f8fafc' },
}, {
  heading: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  body: '"IBM Plex Sans", "Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-semibold',
}, {
  cardRadius: '0.375rem',
  buttonRadius: '0.375rem',
  cardShadow: '0 2px 6px rgba(30,58,95,0.08)',
  borderWidth: '1px',
});
const freshStyles = makeLightTemplate(freshPalette, {
  bodyStyle: { backgroundColor: '#fafffe' },
  sectionAltStyle: { backgroundColor: '#f0fdf4' },
}, {
  heading: '"Poppins", "Inter", system-ui, sans-serif',
  body: '"Poppins", "Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-bold',
}, {
  cardRadius: '1rem',
  buttonRadius: '9999px',
  cardShadow: '0 4px 16px rgba(22,163,74,0.10)',
  borderWidth: '1px',
});
const coastalStyles = makeLightTemplate(coastalPalette, {
  bodyStyle: { backgroundColor: '#f0f9ff' },
  sectionAltStyle: { backgroundColor: '#e0f2fe' },
}, {
  heading: '"DM Serif Display", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-normal',
}, {
  cardRadius: '1.25rem',
  buttonRadius: '9999px',
  cardShadow: '0 6px 20px rgba(14,165,233,0.12)',
  borderWidth: '1px',
});
const sunsetStyles = makeLightTemplate(sunsetPalette, {
  bodyStyle: { backgroundColor: '#fff7ed' },
  sectionAltStyle: { backgroundColor: '#ffedd5' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #7c2d12 0%, #f97316 100%)' },
}, {
  heading: '"Fraunces", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-bold',
}, {
  cardRadius: '1rem',
  buttonRadius: '9999px',
  cardShadow: '0 8px 24px rgba(249,115,22,0.15)',
  borderWidth: '1px',
});
const forestStyles = makeLightTemplate(forestPalette, {
  bodyStyle: { backgroundColor: '#f7faf7' },
  sectionAltStyle: { backgroundColor: '#ecfdf5' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)' },
}, {
  heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-semibold',
}, {
  cardRadius: '0.75rem',
  buttonRadius: '0.5rem',
  cardShadow: '0 4px 16px rgba(6,78,59,0.10)',
  borderWidth: '1px',
});

const monochromeStyles = makeLightTemplate(monochromePalette, {
  heroStyle: { backgroundColor: '#000000' },
  heroOverlayStyle: { background: '#000000' },
  heroTitleStyle: { color: '#ffffff' },
  surfaceDeepFill: '#000000',
  sectionAltStyle: { backgroundColor: '#fafafa' },
}, {
  heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-[-0.05em] font-black uppercase',
}, {
  cardRadius: '0', buttonRadius: '0',
  cardShadow: 'none', borderWidth: '2px',
});
const rosegoldStyles = makeLightTemplate(rosegoldPalette, {
  bodyStyle: { backgroundColor: '#fff1f2' },
  sectionAltStyle: { backgroundColor: '#ffe4e6' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #831843 0%, #e11d48 100%)' },
}, {
  heading: '"Fraunces", "Playfair Display", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'italic font-medium tracking-tight',
}, {
  cardRadius: '1.5rem', buttonRadius: '9999px',
  cardShadow: '0 8px 24px rgba(225,29,72,0.12)', borderWidth: '1px',
});
const desertStyles = makeLightTemplate(desertPalette, {
  bodyStyle: { backgroundColor: '#fffbeb' },
  sectionAltStyle: { backgroundColor: '#fef3c7' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #92400e 0%, #d97706 100%)' },
}, {
  heading: '"DM Serif Display", "Playfair Display", Georgia, serif',
  body: '"Lora", Georgia, serif',
  headingClass: 'tracking-tight font-normal',
}, {
  cardRadius: '0.5rem', buttonRadius: '0.25rem',
  cardShadow: '0 6px 18px rgba(146,64,14,0.12)', borderWidth: '1px',
});
const arcticStyles = makeLightTemplate(arcticPalette, {
  bodyStyle: { backgroundColor: '#f0f9ff' },
  sectionAltStyle: { backgroundColor: '#e0f2fe' },
  heroStyle: { backgroundColor: '#e0f2fe' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #e0f2fe 0%, #cffafe 100%)' },
  heroTitleStyle: { color: '#0c4a6e' },
  heroSubtitleStyle: { color: '#0e7490' },
  surfaceDeepFill: '#0c4a6e',
}, {
  heading: '"Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-[-0.03em] font-light',
}, {
  cardRadius: '0.75rem', buttonRadius: '0.5rem',
  cardShadow: '0 2px 8px rgba(6,182,212,0.08)', borderWidth: '1px',
});
const royalStyles = makeLightTemplate(royalPalette, {
  bodyStyle: { backgroundColor: '#faf5ff' },
  sectionAltStyle: { backgroundColor: '#f3e8ff' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #3b0764 0%, #6b21a8 100%)' },
}, {
  heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
  body: '"Lora", Georgia, serif',
  headingClass: 'italic font-semibold tracking-tight',
}, {
  cardRadius: '0.5rem', buttonRadius: '0.375rem',
  cardShadow: '0 10px 30px rgba(59,7,100,0.18)', borderWidth: '1px',
});
const vintageStyles = makeLightTemplate(vintagePalette, {
  bodyStyle: { backgroundColor: '#fbf5e6' },
  sectionAltStyle: { backgroundColor: '#fef6e4' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)' },
}, {
  heading: '"Playfair Display", Georgia, serif',
  body: '"Lora", Georgia, serif',
  headingClass: 'tracking-tight font-bold uppercase',
}, {
  cardRadius: '0.125rem', buttonRadius: '0.125rem',
  cardShadow: '0 4px 12px rgba(127,29,29,0.10)', borderWidth: '2px',
});
const lavenderStyles = makeLightTemplate(lavenderPalette, {
  bodyStyle: { backgroundColor: '#faf5ff' },
  sectionAltStyle: { backgroundColor: '#ede9fe' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #6b21a8 0%, #8b5cf6 100%)' },
}, {
  heading: '"Poppins", "Inter", system-ui, sans-serif',
  body: '"Poppins", "Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-semibold',
}, {
  cardRadius: '1.25rem', buttonRadius: '9999px',
  cardShadow: '0 6px 20px rgba(139,92,246,0.12)', borderWidth: '1px',
});
const tropicalStyles = makeLightTemplate(tropicalPalette, {
  bodyStyle: { backgroundColor: '#f0fdfa' },
  sectionAltStyle: { backgroundColor: '#ccfbf1' },
  heroOverlayStyle: { background: 'linear-gradient(135deg, #115e59 0%, #14b8a6 70%, #facc15 100%)' },
}, {
  heading: '"Poppins", "Inter", system-ui, sans-serif',
  body: '"Inter", system-ui, sans-serif',
  headingClass: 'tracking-tight font-extrabold',
}, {
  cardRadius: '1rem', buttonRadius: '9999px',
  cardShadow: '0 8px 22px rgba(20,184,166,0.15)', borderWidth: '1px',
});

const cyberpunkStyles: TemplateStyles = {
  headerClass: 'border-b',
  headerStyle: { backgroundColor: '#0a0014', borderColor: 'rgba(236,72,153,0.25)', color: '#f0abfc' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#0a0014', borderColor: 'rgba(236,72,153,0.25)', color: '#f0abfc' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#0a0014', color: '#f0abfc' },
  heroClass: '',
  heroStyle: { backgroundColor: '#0a0014' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(135deg, #0a0014 0%, #581c87 50%, #ec4899 100%)' },
  heroTitleClass: 'tracking-tight font-bold uppercase',
  heroTitleStyle: { color: '#f0abfc', textShadow: '0 0 24px rgba(236,72,153,0.6)' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: '#67e8f9' },
  cardClass: 'rounded-lg',
  cardStyle: { backgroundColor: '#170028', borderWidth: '1px', borderColor: 'rgba(236,72,153,0.3)', color: '#f0abfc' },
  cardHoverClass: 'hover:border-cyan-400/60',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#120020' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-lg',
  testimonialHighlightStyle: { backgroundColor: '#ec4899', color: '#ffffff', borderColor: '#06b6d4' },
  testimonialNormalClass: 'rounded-lg',
  testimonialNormalStyle: { backgroundColor: '#170028', borderColor: 'rgba(236,72,153,0.3)', color: '#f0abfc' },
  searchBarClass: 'rounded-lg shadow-2xl',
  searchBarStyle: { backgroundColor: 'rgba(23,0,40,0.92)', borderWidth: '1px', borderColor: 'rgba(6,182,212,0.4)', backdropFilter: 'blur(12px)' },
  iconBgClass: '',
  iconBgStyle: { backgroundColor: 'rgba(236,72,153,0.16)', color: '#06b6d4' },
  subHeroClass: '',
  isDark: true,
  surfaceFill: '#0a0014',
  surfaceDeepFill: '#0a0014',
  tokens: cyberpunkTokens,
  palette: cyberpunkPalette,
  typography: {
    heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
    body: '"Space Grotesk", "Inter", system-ui, sans-serif',
    headingClass: 'tracking-tight font-bold uppercase',
  },
  shape: { cardRadius: '0.5rem', buttonRadius: '0.25rem',
    cardShadow: '0 0 24px rgba(236,72,153,0.25)', borderWidth: '1px' },
};

const noirStyles: TemplateStyles = {
  headerClass: 'border-b',
  headerStyle: { backgroundColor: '#18181b', borderColor: 'rgba(220,38,38,0.2)', color: '#fafafa' },
  footerClass: 'border-t',
  footerStyle: { backgroundColor: '#09090b', borderColor: 'rgba(220,38,38,0.2)', color: '#fafafa' },
  bodyClass: '',
  bodyStyle: { backgroundColor: '#18181b', color: '#fafafa' },
  heroClass: '',
  heroStyle: { backgroundColor: '#09090b' },
  heroOverlayClass: '',
  heroOverlayStyle: { background: 'linear-gradient(135deg, #09090b 0%, #27272a 70%, #7f1d1d 100%)' },
  heroTitleClass: 'font-serif italic tracking-tight',
  heroTitleStyle: { color: '#fafafa' },
  heroSubtitleClass: '',
  heroSubtitleStyle: { color: 'rgba(250,250,250,0.7)' },
  cardClass: 'rounded-md',
  cardStyle: { backgroundColor: '#27272a', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.08)', color: '#fafafa' },
  cardHoverClass: 'hover:border-red-500/40',
  sectionAltClass: '',
  sectionAltStyle: { backgroundColor: '#1c1c1f' },
  primaryBtnClass: '',
  testimonialHighlightClass: 'rounded-md',
  testimonialHighlightStyle: { backgroundColor: '#dc2626', color: '#ffffff', borderColor: '#dc2626' },
  testimonialNormalClass: 'rounded-md',
  testimonialNormalStyle: { backgroundColor: '#27272a', borderColor: 'rgba(255,255,255,0.08)', color: '#fafafa' },
  searchBarClass: 'rounded-md shadow-2xl',
  searchBarStyle: { backgroundColor: 'rgba(39,39,42,0.92)', borderWidth: '1px', borderColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(12px)' },
  iconBgClass: '',
  iconBgStyle: { backgroundColor: 'rgba(220,38,38,0.14)', color: '#ef4444' },
  subHeroClass: '',
  isDark: true,
  surfaceFill: '#18181b',
  surfaceDeepFill: '#09090b',
  tokens: noirTokens,
  palette: noirPalette,
  typography: {
    heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    body: '"Inter", system-ui, sans-serif',
    headingClass: 'italic font-medium tracking-tight',
  },
  shape: { cardRadius: '0.375rem', buttonRadius: '0.25rem',
    cardShadow: '0 12px 30px rgba(0,0,0,0.5)', borderWidth: '1px' },
};

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
  tokens: midnightTokens,
  palette: midnightPalette,
  typography: {
    heading: '"Space Grotesk", "Inter", system-ui, sans-serif',
    body: '"Inter", system-ui, sans-serif',
    headingClass: 'tracking-tight font-bold',
  },
  shape: {
    cardRadius: '1rem',
    buttonRadius: '9999px',
    cardShadow: '0 12px 32px rgba(168,85,247,0.18)',
    borderWidth: '1px',
  },
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
  tokens: blacklaneTokens,
  palette: blacklanePalette,
  typography: {
    heading: '"Cormorant Garamond", "Playfair Display", Georgia, serif',
    body: '"Inter", system-ui, sans-serif',
    headingClass: 'italic font-medium tracking-tight',
  },
  shape: {
    cardRadius: '1rem',
    buttonRadius: '0.5rem',
    cardShadow: '0 16px 48px rgba(0,0,0,0.5)',
    borderWidth: '1px',
  },
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
  monochrome: monochromeStyles,
  rosegold: rosegoldStyles,
  desert: desertStyles,
  arctic: arcticStyles,
  royal: royalStyles,
  cyberpunk: cyberpunkStyles,
  vintage: vintageStyles,
  lavender: lavenderStyles,
  noir: noirStyles,
  tropical: tropicalStyles,
};

export const getTemplateStyles = (template: StorefrontTemplate): TemplateStyles => {
  return STYLE_MAP[template] ?? classicStyles;
};
