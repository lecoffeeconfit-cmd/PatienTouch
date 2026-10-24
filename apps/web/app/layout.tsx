import type { Metadata } from 'next';
import '@patient-touch/ui/styles.css';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Patient Touch · Thoughtfully connected care', template: '%s · Patient Touch' },
  description:
    'A synthetic preview of thoughtful therapy practice management and continuity of care.',
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  if (process.env.NEXT_PUBLIC_APP_MODE && process.env.NEXT_PUBLIC_APP_MODE !== 'demo')
    throw new Error(
      'Only synthetic demo mode is implemented. Configure production authentication before enabling another mode.',
    );
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
