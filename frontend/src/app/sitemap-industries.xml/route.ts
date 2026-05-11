import { NextResponse } from 'next/server';
import {
  buildUrlSetXml,
  getSitemapBaseUrl,
  SitemapUrlEntry,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getIndustryLastmod } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-dynamic';

const countries = ['usa', 'dubai', 'uk', 'singapore', 'australia', 'saudi-arabia', 'in', 'netherlands'];
const industrySubPages = [
    'saas', 'ecommerce', 'consulting', 'real-estate', 'logistics', 
    'startups', 'agencies', 'healthcare', 'manufacturing', 'fintech'
];

export async function GET() {
  const entries: SitemapUrlEntry[] = countries.flatMap((country) => [
    {
      path: `/${country}/industries`,
      lastmod: getIndustryLastmod(country),
      changefreq: 'monthly' as const,
      priority: 0.7,
    },
    ...industrySubPages.map((industry) => ({
      path: `/${country}/industries/${industry}`,
      lastmod: getIndustryLastmod(country, industry),
      changefreq: 'monthly' as const,
      priority: 0.7,
    })),
  ]);

  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());

  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
