import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Virtual CFO Services in Dubai | Strategic Financial Growth',
  description:
    'Scale your UAE business with expert Virtual CFO services in Dubai. We provide strategic financial modeling, cash flow management, and fundraising support.',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai/virtual-cfo',
  },
};

export default function DubaiVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

