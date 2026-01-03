import { MetadataRoute } from 'next'
import { BASE_URL } from '@/utils/url'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = BASE_URL


    const routes = [
        '',
        '/discover',
        '/partners',
        '/premium',
        '/changelog',
        '/support',
        '/legal/privacy',
        '/legal/terms',
    ]

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }))
}
