import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://sourcely.shop'

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: [
                '/api/',
                '/dashboard/',
                '/settings/',
                '/admin/',
                '/login/',
                '/signup/',
                '/auth/',
            ],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
