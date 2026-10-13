/** @type {import('next').NextConfig} */

// فقط برای dev — SSL self-signed رو bypass می‌کنه
if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const nextConfig = {
  turbopack: {},
  distDir: process.env.NEXT_BUILD_DIR || '.next',
}

module.exports = nextConfig
