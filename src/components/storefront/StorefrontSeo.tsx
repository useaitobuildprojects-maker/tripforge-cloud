import { Helmet } from 'react-helmet-async';
import { Agency, StorefrontPage } from '@/types/agency';

interface StorefrontSeoProps {
  agency: Agency;
  page: StorefrontPage;
  fallbackTitle: string;
  fallbackDescription: string;
}

const StorefrontSeo = ({ agency, page, fallbackTitle, fallbackDescription }: StorefrontSeoProps) => {
  const pageSeo = agency.page_seo?.[page];

  const title = pageSeo?.meta_title || fallbackTitle;
  const description = pageSeo?.meta_description || fallbackDescription;
  const ogImage = pageSeo?.og_image || agency.og_image;
  const canonicalUrl = agency.domain ? `https://${agency.domain}` : undefined;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
    </Helmet>
  );
};

export default StorefrontSeo;
