// SEO INTENT: This is the root sitemap index file. Its only job is to point crawlers to the other specialized sitemaps.
// The order is critical for signaling authority: Pillars > Services > Industries > Blog > Countries > Core
// This structure tells search engines to prioritize crawling our most important pages first.

import { NextResponse } from 'next/server';
import {
  buildSitemapIndexXml,
  getSitemapBaseUrl,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getSitemapFileLastmod } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-dynamic';

// The list and order of sitemaps are explicitly defined as per the authority-first strategy.
const sitemaps = [
  'sitemap-pillars.xml',
  'sitemap-services.xml',
  'sitemap-industries.xml',
  'sitemap-blog-usa.xml',
  'sitemap-blog-international.xml',
  'sitemap-countries.xml',
  'sitemap-core.xml',
];

export async function GET() {
  const baseUrl = getSitemapBaseUrl();
  const sitemapIndex = buildSitemapIndexXml(
    sitemaps.map((sitemapName) => ({
      loc: `${baseUrl}/${sitemapName}`,
      lastmod: getSitemapFileLastmod(sitemapName),
    }))
  );

  return new NextResponse(sitemapIndex, {
    headers: SITEMAP_XML_HEADERS,
  });
}
