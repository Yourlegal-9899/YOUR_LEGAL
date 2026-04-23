import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register a Business in India | Company Formation | YourLegal',
  description:
    'Register a business in India with ease. We handle Pvt Ltd incorporation, GST, and MCA compliance for global founders. Get a free India consultation today!',
  alternates: {
    canonical: 'https://www.yourlegal.io/in',
  },
};

export default function IndiaLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

