const SUPABASE_URL = 'https://uypsjomkikkvbmutsjkt.supabase.co';

/**
 * Build a shareable URL that returns proper OG meta tags for social media crawlers.
 * The edge function serves HTML with correct meta then redirects to the real page.
 */
export const getShareUrl = (slug: string, page: string = 'home'): string => {
  return `${SUPABASE_URL}/functions/v1/bright-action?slug=${encodeURIComponent(slug)}&page=${encodeURIComponent(page)}`;
};
