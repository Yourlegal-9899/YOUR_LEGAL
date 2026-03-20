'use client';

import { NavHeader } from '@/components/layout/page-header';

export function NavHeaderClient() {
  const noop = () => {};
  return <NavHeader onLoginClick={noop} onSignupClick={noop} />;
}
