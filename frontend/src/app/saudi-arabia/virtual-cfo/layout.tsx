import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Expert Virtual CFO Services in Saudi Arabia| YourLegal',
  description:
    'Get strategic financial leadership with YourLegal’s Virtual CFO services in Saudi Arabia. Manage cash flow, bids, and growth in alignment with Vision 2030.',
  alternates: {
    canonical: 'https://www.yourlegal.io/saudi-arabia/virtual-cfo',
  },
};

export default function SaudiArabiaVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

