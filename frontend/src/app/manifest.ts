import { MetadataRoute } from 'next';
import { businessConfig } from '@/config/business';

/**
 * Dynamic web app manifest (PWA compatibility)
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: businessConfig.name,
    short_name: businessConfig.shortName,
    description: businessConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a', // Dark mode slate matching theme variables
    theme_color: '#1877f2', // Primary FB Blue
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  };
}
