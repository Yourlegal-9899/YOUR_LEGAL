import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard - YourLegal',
  description: 'Professional admin dashboard for managing legal services platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
}