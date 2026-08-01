import { MetadataRoute } from 'next';

/**
 * Dynamic sitemap generator mapping all primary routes
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://trustzone.care'; // Canonical Base URL
  const lastModified = new Date();

  // Root level routes
  const staticRoutes = [
    '',
    '/about',
    '/services',
    '/pricing',
    '/before-after',
    '/gallery',
    '/testimonials',
    '/faq',
    '/blog',
    '/contact',
    '/booking',
    '/tracking',
    '/warranty',
    '/privacy',
    '/terms',
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/booking' || route === '/services' ? 0.9 : 0.7,
  }));

  // Dynamic Service Details Routes
  const dynamicServiceRoutes = [
    'screen-replacement',
    'battery-diagnostics',
    'water-decontamination',
    'charging-port',
    'logicboard-soldering',
    'camera-sensors',
  ].map((serviceId) => ({
    url: `${baseUrl}/services/${serviceId}`,
    lastModified,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  return [...sitemapEntries, ...dynamicServiceRoutes];
}
