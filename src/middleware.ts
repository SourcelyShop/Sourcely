import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ROOT_DOMAIN } from '@/utils/url'

export function middleware(request: NextRequest) {
    const url = request.nextUrl
    const hostname = request.headers.get('host') || ''
    const searchParams = request.nextUrl.searchParams.toString()
    const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ''}`

    // Explicitly allow root path to bypass any potential redirect logic
    if (url.pathname === '/') {
        // But still enforce non-www if needed
        if (hostname === `www.${ROOT_DOMAIN}`) {
            url.hostname = ROOT_DOMAIN
            return NextResponse.redirect(url)
        }
        return NextResponse.next()
    }

    // Redirect www to non-www (canonical)
    if (hostname === `www.${ROOT_DOMAIN}`) {
        url.hostname = ROOT_DOMAIN
        return NextResponse.redirect(url)
    }

    // Check if the hostname starts with 'waitlist.'
    // Adjust 'localhost:3000' to your production domain when deploying
    const rootDomain = ROOT_DOMAIN
    const isWaitlistSubdomain = rootDomain
        ? hostname === `waitlist.${rootDomain}`
        : hostname.startsWith('waitlist.')

    // If the subdomain is 'waitlist', rewrite to the /waitlist page
    if (isWaitlistSubdomain) {
        url.pathname = `/waitlist`
        return NextResponse.rewrite(url)
    }

    // Prevent direct access to /waitlist from main domain
    // Only redirect if we are NOT on the waitlist subdomain
    if (url.pathname.startsWith('/waitlist') && !isWaitlistSubdomain) {
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
