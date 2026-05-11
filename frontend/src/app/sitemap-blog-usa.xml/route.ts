// SEO INTENT: This sitemap contains our US-focused "cluster" content.
// These pages support our main pillars and are designed to rank for long-tail keywords.
// By separating them, we create a clear topical cluster for the US market.
// A priority of 0.7 signals their importance as supporting content for our main pillars.

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
        (entry) =>
          String(entry.country || '').toUpperCase() === 'USA' &&
          entry.category !== 'Pillar'
      )
      .map((entry) => ({
        path: entry.path,
        lastmod: entry.lastmod,
        changefreq: 'monthly',
        priority: 0.7,
      }));
    const sitemap = buildUrlSetXml(entries, getSitemapBaseUrl());

    return new NextResponse(sitemap, {
        headers: SITEMAP_XML_HEADERS,
    });
}
