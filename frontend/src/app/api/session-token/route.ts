import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import {
  FRONTEND_AUTH_TOKEN_COOKIE,
  FRONTEND_AUTH_TOKEN_MAX_AGE_SECONDS,
} from '@/lib/auth-cookie';

const buildCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawToken = typeof body?.token === 'string' ? body.token.trim() : '';

  if (!rawToken) {
    return NextResponse.json({ message: 'Token is required.' }, { status: 400 });
  }

  const cookieStore = await cookies();
  cookieStore.set(FRONTEND_AUTH_TOKEN_COOKIE, rawToken, {
    ...buildCookieOptions(),
    maxAge: FRONTEND_AUTH_TOKEN_MAX_AGE_SECONDS,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.set(FRONTEND_AUTH_TOKEN_COOKIE, '', {
    ...buildCookieOptions(),
    maxAge: 0,
  });

  return NextResponse.json({ success: true });
}
