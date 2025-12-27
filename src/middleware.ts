import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const url = request.nextUrl
    const hostname = request.headers.get('host') || ''

    // Check if the hostname starts with 'waitlist.'
    // Adjust 'localhost:3000' to your production domain when deploying
    const currentHost = process.env.NODE_ENV === 'production'
        ? hostname.replace(`.${process.env.NEXT_PUBLIC_ROOT_DOMAIN}`, '')
        : hostname.replace(`.localhost:3000`, '')

    // If the subdomain is 'waitlist', rewrite to the /waitlist page
    // If the subdomain is 'waitlist', rewrite to the /waitlist page
    if (hostname.includes('waitlist')) {
        url.pathname = `/waitlist`
        return NextResponse.rewrite(url)
    }

    // Prevent direct access to /waitlist from main domain
    // Only redirect if we are NOT on the waitlist subdomain
    if (url.pathname.startsWith('/waitlist') && !hostname.includes('waitlist')) {
        url.pathname = '/'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
