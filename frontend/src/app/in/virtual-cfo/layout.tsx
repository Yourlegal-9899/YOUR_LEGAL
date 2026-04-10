import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Virtual CFO Services in India | YourLegal',
  description:
    'Scale your business with best Virtual CFO services in India. Strategic support for SMEs, foreign subsidiaries, and startups for fundraising, MIS, and growth.',
};

export default function IndiaVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
