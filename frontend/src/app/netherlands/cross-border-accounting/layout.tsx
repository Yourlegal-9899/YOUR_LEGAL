import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cross-border accounting in Netherlands | YourLegal',
  description:
    'Expert cross-border accounting in Netherlands for Dutch B.V. We manage transfer pricing, tax treaties, and EU VAT to ensure compliance and tax efficiency.',
};

export default function NetherlandsCrossBorderAccountingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
