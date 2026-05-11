import { NextResponse } from 'next/server';
import {
  getSitemapBaseUrl,
  getSitemapLastModifiedDate,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';

export const dynamic = 'force-dynamic';

const staticPages = [
    { url: '/', priority: 1.0 },
    { url: '/why-choose-us', priority: 0.8 },
    { url: '/products', priority: 0.8 },
    { url: '/industries', priority: 0.8 },
    { url: '/global-compliance', priority: 0.8 },
    { url: '/pricing-philosophy', priority: 0.7 },
    { url: '/case-studies', priority: 0.7 },
    { url: '/company/about', priority: 0.6 },
    { url: '/company/partner', priority: 0.6 },
    { url: '/support/contact-sales', priority: 0.6 },
    { url: '/blog', priority: 0.9 },
];

function generateSitemap(
  pages: { url: string, priority: number }[],
  baseUrl: string,
  lastModified: string
) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${pages
    .map((page) => `
    <url>
      <loc>${baseUrl}${page.url}</loc>
      <lastmod>${lastModified}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page.priority.toFixed(1)}</priority>
    </url>`)
    .join('')}
</urlset>`;
}

export async function GET() {
  const sitemap = generateSitemap(
    staticPages,
    getSitemapBaseUrl(),
    getSitemapLastModifiedDate()
  );
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
