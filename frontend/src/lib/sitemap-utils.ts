const DEFAULT_SITE_URL = 'https://www.yourlegal.io';

export const getSitemapBaseUrl = () =>
  String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL)
    .trim()
    .replace(/\/+$/, '');

export const getSitemapLastModifiedDate = () => new Date().toISOString().slice(0, 10);

export const SITEMAP_XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};
