import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { businessConfig as config } from '@/config/business';
import { AuthProvider } from '@/context/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: `${config.name} | ${config.tagline}`,
    template: `%s | ${config.name}`,
  },
  description: config.description,
  metadataBase: new URL('https://trustzone.care'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: config.name,
    description: config.description,
    url: 'https://trustzone.care',
    siteName: config.name,
    locale: 'en_BD',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: config.name,
    description: config.description,
  },
};

import { headers } from 'next/headers';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isAdmin = pathname.startsWith('/admin');

  // Central JSON-LD Structured Data Schema matching Task 7
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    'name': config.name,
    'description': config.description,
    'url': 'https://trustzone.care',
    'telephone': config.helpline,
    'email': config.email,
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': config.branches[0].address,
      'addressLocality': 'Dhaka',
      'postalCode': '1209',
      'addressCountry': 'BD',
    },
    'openingHoursSpecification': {
      '@type': 'OpeningHoursSpecification',
      'dayOfWeek': [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ],
      'opens': '10:00',
      'closes': '20:00'
    }
  };

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('tz_theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <AuthProvider>
          {!isAdmin && <Navbar />}
          <main className="flex-grow flex flex-col">{children}</main>
          {!isAdmin && <Footer />}
        </AuthProvider>
      </body>
    </html>
  );
}
