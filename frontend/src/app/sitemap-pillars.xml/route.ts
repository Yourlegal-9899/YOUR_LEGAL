// SEO INTENT: This sitemap is for our highest authority "Pillar Pages".
// These pages are the cornerstones of our content strategy for the US market.
// By isolating them and giving them top priority (1.0) and frequent change frequency (weekly),
// we signal to Google that these are the most important pages to crawl and rank for broad, competitive head terms.

import { NextResponse } from 'next/server';
import {
  buildUrlSetXml,
  getSitemapBaseUrl,
  SitemapUrlEntry,
  SITEMAP_XML_HEADERS,
} from '@/lib/sitemap-utils';
import { getMergedBlogSitemapEntries } from '@/lib/sitemap-blog-data';

export const dynamic = 'force-dynamic';

export async function GET() {
  const blogEntries = await getMergedBlogSitemapEntries();
  const entries: SitemapUrlEntry[] = blogEntries
    .filter((entry) => entry.category === 'Pillar')
    .map((entry) => ({
      path: entry.path,
      lastmod: entry.lastmod,
      changefreq: 'weekly',
      priority: 1.0,
    }));
  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
