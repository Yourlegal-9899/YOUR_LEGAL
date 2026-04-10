import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Company Formation in Saudi Arabia| MISA License |YourLegal',
  description:
    'Expert Company formation in Saudi Arabia, including MISA licensing, tax compliance and more. Trusted by global founders. Book a free consultation today!',
};

export default function SaudiArabiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
