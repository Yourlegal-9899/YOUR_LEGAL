// SEO INTENT: This sitemap lists our main country landing pages.
// These are important navigational hubs but are secondary in authority to our pillar and service pages.
// A priority of 0.6 ensures they are crawled regularly but do not compete with our core content.

import { NextResponse } from 'next/server';
import {
  buildUrlSetXml,
  getSitemapBaseUrl,
  SitemapUrlEntry,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getCountryLastmod } from '@/lib/sitemap-lastmod';

export const dynamic = 'force-dynamic';

const countries = [
    '/usa',
    '/uk',
    '/dubai',
    '/singapore',
    '/australia',
    '/saudi-arabia',
    '/in',
    '/netherlands'
];

const getCountrySlugFromPath = (path: string) => path.replace(/^\//, '');

export async function GET() {
  const entries: SitemapUrlEntry[] = countries.map((path) => ({
    path,
    lastmod: getCountryLastmod(getCountrySlugFromPath(path)),
    changefreq: 'monthly',
    priority: 0.8,
  }));
  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
