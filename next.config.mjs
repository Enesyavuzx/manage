/** @type {import('next').NextConfig} */

// MOBILE_EXPORT=1 olduğunda Capacitor için statik export (`out/`) üretilir.
// Bu modda `headers()` desteklenmez ve next/image optimizasyonu kapatılır.
// Normal web/SSR build'i (varsayılan) bundan etkilenmez.
const mobile = process.env.MOBILE_EXPORT === '1'

const base = {
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ]
  },
}

const mobileConfig = {
  output: 'export',
  images: { unoptimized: true },
}

const nextConfig = mobile ? mobileConfig : base

export default nextConfig
