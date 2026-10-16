import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/';
  const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!code || !url || !anon) return NextResponse.redirect(new URL('/', request.url));
  const response = NextResponse.redirect(new URL(safeNext, request.url));
  const store = await cookies();
  const supabase = createServerClient(url, anon, { cookies: {
    getAll: () => store.getAll(),
    setAll: items => items.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
  } });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL('/?auth=reset-error', request.url));
  return response;
}
