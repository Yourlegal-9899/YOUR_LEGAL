import { API_BASE_URL } from '@/lib/api-base';
import { allPosts } from '@/lib/blog-posts';
import { getStaticBlogLastmod } from '@/lib/sitemap-lastmod';
import { normalizeSitemapDate } from '@/lib/sitemap-utils';

export type BlogSitemapEntry = {
  path: string;
  category: string;
  country?: string;
  slug: string;
  lastmod?: string;
  source: 'static' | 'db';
};

const getSlugFromPath = (path: string) => {
  const sanitized = String(path || '').split('?')[0].split('#')[0];
  const parts = sanitized.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
};

const getSafePath = (value: string) => {
  const normalized = String(value || '').trim();
  if (!normalized) return '';
  return normalized.startsWith('/') ? normalized : `/${normalized}`;
};

const getDbBlogPath = (slug: string) => `/blog/${slug}`;

const buildStaticBlogEntries = (): BlogSitemapEntry[] =>
  allPosts
    .map((post) => {
      const path = getSafePath(post.path);
      const slug = getSlugFromPath(path);
      if (!path || !slug) return null;

      return {
        path,
        category: String(post.category || 'General'),
        country: post.country ? String(post.country) : undefined,
        slug,
        lastmod: getStaticBlogLastmod(path, post.category),
        source: 'static' as const,
      };
    })
    .filter((entry): entry is BlogSitemapEntry => Boolean(entry));

const fetchPublishedDbBlogs = async (): Promise<BlogSitemapEntry[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs?status=published&limit=500`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = (await response.json().catch(() => null)) as
      | {
          blogs?: Array<{
            slug?: string;
            category?: string;
            country?: string;
            updatedAt?: string;
            publishedAt?: string;
            createdAt?: string;
          }>;
        }
      | null;

    if (!response.ok || !Array.isArray(data?.blogs)) {
      return [];
    }

    return data.blogs
      .map((blog) => {
        const slug = String(blog?.slug || '').trim();
        if (!slug) return null;

        const lastmod = normalizeSitemapDate(
          blog?.updatedAt || blog?.publishedAt || blog?.createdAt || undefined
        );

        return {
          path: getDbBlogPath(slug),
          category: String(blog?.category || 'General'),
          country: blog?.country ? String(blog.country) : undefined,
          slug,
          lastmod,
          source: 'db' as const,
        };
      })
      .filter((entry): entry is BlogSitemapEntry => Boolean(entry));
  } catch {
    return [];
  }
};

export const getMergedBlogSitemapEntries = async (): Promise<BlogSitemapEntry[]> => {
  const staticEntries = buildStaticBlogEntries();
  const dbEntries = await fetchPublishedDbBlogs();

  if (!dbEntries.length) {
    return staticEntries;
  }

  const hiddenStaticSlugs = new Set(
    dbEntries
      .filter((entry) => entry.path.startsWith('/blog/'))
      .map((entry) => entry.slug)
  );

  const merged = new Map<string, BlogSitemapEntry>();

  staticEntries.forEach((entry) => {
    if (entry.path.startsWith('/blog/') && hiddenStaticSlugs.has(entry.slug)) return;
    merged.set(entry.slug, entry);
  });

  dbEntries.forEach((entry) => {
    const existing = merged.get(entry.slug);
    if (!existing) {
      merged.set(entry.slug, entry);
      return;
    }

    merged.set(entry.slug, {
      ...existing,
      ...entry,
      // Keep static non-blog URL paths as-is if we have one.
      path: existing.path.startsWith('/blog/') ? entry.path : existing.path,
      // Keep a known static lastmod when DB entry has no date.
      lastmod: entry.lastmod || existing.lastmod,
      source: entry.source,
    });
  });

  return Array.from(merged.values());
};
