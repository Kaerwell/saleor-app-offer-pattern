import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTenantConfig } from './lib/tenant-config'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')
  
  // Skip for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  const tenant = await getTenantConfig(hostname)
  
  if (!tenant) {
    return new NextResponse('Store not found', { status: 404 })
  }

  // Add store slug to request headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-store-slug', tenant.storeSlug)

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
