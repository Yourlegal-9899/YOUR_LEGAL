import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Virtual CFO Services to Scale Your Business | YourLegal',
  description:
    'Get the Best virtual CFO services in the USA. Strategic financial leadership to help your business scale, raise capital, and maximize profitability.',
  alternates: {
    canonical: 'https://www.yourlegal.io/usa/virtual-cfo',
  },
};

export default function VirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

