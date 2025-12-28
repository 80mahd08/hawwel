import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'hawwel - Property Rentals',
    short_name: 'hawwel',
    description: 'Find your perfect stay in Tunisia',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1c73a1',
    icons: [
      {
        src: '/logo-1-removebg.png',
        sizes: 'any',
        type: 'image/png',
      },
    ],
  }
}
