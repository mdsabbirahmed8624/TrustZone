import { MetadataRoute } from 'next';

/**
 * Dynamic robots.txt indexing configurations
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/admin/',
        '/*?*', // Block query parameters indexing
      ],
    },
    sitemap: 'https://trustzone.care/sitemap.xml',
  };
}
