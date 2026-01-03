import { MetadataRoute } from 'next'
import { BASE_URL } from '@/utils/url'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = BASE_URL

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
