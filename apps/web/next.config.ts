import type { NextConfig } from 'next';
const config: NextConfig = {
  transpilePackages: [
    '@patient-touch/ui',
    '@patient-touch/types',
    '@patient-touch/schemas',
    '@patient-touch/api-client',
    '@patient-touch/auth',
    '@patient-touch/design-tokens',
  ],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};
export default config;
