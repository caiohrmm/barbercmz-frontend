import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Check for access token in cookie or header
    // In a real app, you'd verify the token properly
    // For now, we'll let the client-side handle redirect
    // The API will return 401 if not authenticated
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
