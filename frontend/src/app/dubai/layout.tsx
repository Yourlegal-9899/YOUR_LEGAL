import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dubai Company Formation LLC & Tax Services | YourLegal',
  description:
    'Get expert dubai company formation llc services. We handle 100% foreign ownership, VAT, and corporate tax for global founders. Book your free consultation!',
  alternates: {
    canonical: 'https://www.yourlegal.io/dubai',
  },
};

export default function DubaiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

