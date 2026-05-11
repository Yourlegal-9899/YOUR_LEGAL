const DEFAULT_SITE_URL = 'https://www.yourlegal.io';

export const getSitemapBaseUrl = () =>
  String(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL)
    .trim()
    .replace(/\/+$/, '');

export const normalizeSitemapDate = (value?: string | Date | null) => {
  if (!value) return undefined;
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
};

export type SitemapUrlEntry = {
  path: string;
  lastmod?: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
};

type SitemapIndexEntry = {
  loc: string;
  lastmod?: string;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const buildUrlSetXml = (entries: SitemapUrlEntry[], baseUrl: string) => {
  const body = entries
    .map((entry) => {
      const lastmod = normalizeSitemapDate(entry.lastmod);
      return `
    <url>
      <loc>${escapeXml(`${baseUrl}${entry.path}`)}</loc>${lastmod ? `\n      <lastmod>${lastmod}</lastmod>` : ''}
      <changefreq>${entry.changefreq}</changefreq>
      <priority>${entry.priority.toFixed(1)}</priority>
    </url>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</urlset>`;
};

export const buildSitemapIndexXml = (entries: SitemapIndexEntry[]) => {
  const body = entries
    .map((entry) => {
      const lastmod = normalizeSitemapDate(entry.lastmod);
      return `
    <sitemap>
      <loc>${escapeXml(entry.loc)}</loc>${lastmod ? `\n      <lastmod>${lastmod}</lastmod>` : ''}
    </sitemap>`;
    })
    .join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${body}
</sitemapindex>`;
};

export const SITEMAP_XML_HEADERS = {
  'Content-Type': 'application/xml; charset=utf-8',
  'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
};
