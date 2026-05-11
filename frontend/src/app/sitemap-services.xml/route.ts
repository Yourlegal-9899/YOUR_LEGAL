// SEO INTENT: This sitemap is dedicated to our primary revenue-generating "Service" pages.
// These pages have high commercial intent. By grouping them here with a high priority (0.9),
// we tell search engines that these are critical for our business, encouraging frequent crawling
// and better ranking for commercial queries.

import { NextResponse } from 'next/server';
import {
  buildUrlSetXml,
  getSitemapBaseUrl,
  SitemapUrlEntry,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getServiceLastmod } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-dynamic';

const countries = ['usa', 'dubai', 'uk', 'singapore', 'australia', 'saudi-arabia', 'in', 'netherlands'];
const serviceSubPages = [
    'company-formation', 'annual-compliance', 'tax-compliance', 'bookkeeping', 
    'accounting', 'virtual-cfo', 'payroll', 'cross-border-accounting', 
    'pricing', 'process', 'services'
];

export async function GET() {
  const entries: SitemapUrlEntry[] = countries.flatMap((country) =>
    serviceSubPages.map((subPage) => ({
      path: `/${country}/${subPage}`,
      lastmod: getServiceLastmod(country, subPage),
      changefreq: 'weekly' as const,
      priority: 0.9,
    }))
  );
  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
