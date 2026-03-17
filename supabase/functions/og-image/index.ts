import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SITE_URL = "https://tripforge-cloud.lovable.app";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const rawPage = url.searchParams.get("page") || "home";
    const page = ["home", "fleet", "contact", "about"].includes(rawPage) ? rawPage : "home";

    if (!slug) {
      return new Response("Missing slug parameter", { status: 400, headers: corsHeaders });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    const { data: agency, error } = await supabase
      .from("agencies")
      .select("name, slug, city, country, meta_title, meta_description, og_image, page_seo, logo_url, domain")
      .eq("slug", slug)
      .single();

    if (error || !agency) {
      return new Response("Agency not found", { status: 404, headers: corsHeaders });
    }

    // Resolve per-page SEO, falling back to agency-level then defaults
    const pageSeo = agency.page_seo?.[page] || {};
    const title =
      pageSeo.meta_title ||
      agency.meta_title ||
      `${agency.name} | ${agency.city}, ${agency.country}`;
    const description =
      pageSeo.meta_description ||
      agency.meta_description ||
      `Premium travel services by ${agency.name} in ${agency.city}, ${agency.country}.`;
    const ogImage = pageSeo.og_image || agency.og_image || "";

    // Build the real page URL
    const pagePath = page === "home" ? "" : `/${page}`;
    const realUrl = `${SITE_URL}/agency/${agency.slug}${pagePath}`;

    // Humans should get an immediate HTTP redirect.
    const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
    if (!isSocialCrawler(userAgent)) {
      return Response.redirect(realUrl, 302);
    }

    // Social crawlers should receive HTML with OG/Twitter metadata.
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:url" content="${escapeHtml(realUrl)}" />
  ${ogImage ? `<meta property="og:image" content="${escapeHtml(ogImage)}" />` : ""}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  ${ogImage ? `<meta name="twitter:image" content="${escapeHtml(ogImage)}" />` : ""}
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(realUrl)}">${escapeHtml(agency.name)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(`Error: ${message}`, { status: 500, headers: corsHeaders });
  }
});

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isSocialCrawler(userAgent: string): boolean {
  return [
    "whatsapp",
    "facebookexternalhit",
    "twitterbot",
    "linkedinbot",
    "telegrambot",
    "slackbot",
    "discordbot",
    "skypeuripreview",
  ].some((bot) => userAgent.includes(bot));
}
