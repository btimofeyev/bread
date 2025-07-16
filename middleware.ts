import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Protected routes
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (request.nextUrl.pathname.startsWith('/(auth)') && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Checkout requires authentication
  if (request.nextUrl.pathname.startsWith('/checkout') && !user) {
    return NextResponse.redirect(new URL('/auth/login?redirect=/checkout', request.url))
  }

  // Redirect to menu if user is already logged in and tries to access auth pages
  if ((request.nextUrl.pathname.startsWith('/auth/login') || 
       request.nextUrl.pathname.startsWith('/auth/signup')) && user) {
    return NextResponse.redirect(new URL('/menu', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/(auth)/:path*',
    '/dashboard/:path*',
    '/auth/:path*',
    '/checkout',
  ],
}