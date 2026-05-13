import { Helmet } from 'react-helmet-async';
import { Agency, StorefrontPage } from '@/types/agency';
import { useLocation } from 'react-router-dom';

interface StorefrontSeoProps {
  agency: Agency;
  page: StorefrontPage;
  fallbackTitle: string;
  fallbackDescription: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

const StorefrontSeo = ({ agency, page, fallbackTitle, fallbackDescription, jsonLd }: StorefrontSeoProps) => {
  const pageSeo = agency.page_seo?.[page];

  const title = pageSeo?.meta_title || fallbackTitle;
  const description = pageSeo?.meta_description || fallbackDescription;
  const ogImage = pageSeo?.og_image || agency.og_image;
  const location = useLocation();
  const path = location.pathname || '/';
  const canonicalUrl = agency.domain ? `https://${agency.domain}${path}` : path;
  const ogUrl = canonicalUrl;
  const ldArray = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet key={page}>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:url" content={ogUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      <link rel="canonical" href={canonicalUrl} />
      {ldArray.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
};

export default StorefrontSeo;
