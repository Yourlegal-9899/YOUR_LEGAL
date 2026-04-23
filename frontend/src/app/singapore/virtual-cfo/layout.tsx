import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get Virtual CFO Services in Singapore | YourLegal',
  description:
    'Get expert virtual CFO services in Singapore for financial leadership, cash flow management, and fundraising support. Partner with YourLegal today.',
  alternates: {
    canonical: 'https://www.yourlegal.io/singapore/virtual-cfo',
  },
};

export default function SingaporeVirtualCfoLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

