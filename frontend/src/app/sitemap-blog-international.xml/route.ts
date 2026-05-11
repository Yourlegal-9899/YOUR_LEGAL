// SEO INTENT: This sitemap is for our non-US, standalone blog content.
// These pages are valuable but are lower priority than our core US pillar/cluster content.
// By giving them a lower priority (0.5) and less frequent change frequency (monthly),
// we guide crawl budget towards our primary commercial pages while still ensuring these get indexed.

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
    .filter(
      (entry) => entry.country && String(entry.country).toUpperCase() !== 'USA'
    )
    .map((entry) => ({
      path: entry.path,
      lastmod: entry.lastmod,
      changefreq: 'monthly',
      priority: 0.5,
    }));
  const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());
  
  return new NextResponse(sitemap, {
    headers: SITEMAP_XML_HEADERS,
  });
}
