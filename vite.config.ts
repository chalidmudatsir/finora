import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/finora/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['finora-icon.svg'],
      manifest: {
        name: 'FINORA Personal Finance',
        short_name: 'FINORA',
        description: 'Take Control. Build Your Future.',
        theme_color: '#101a3a',
        background_color: '#f5f6fa',
        display: 'standalone',
        scope: '/finora/',
        start_url: '/finora/',
        icons: [
          { src: '/finora/finora-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
        ]
      },
      workbox: {
        navigateFallback: 'index.html',
        globPatterns: ['**/*.{js,css,html,svg,png,ico}']
      }
    })
  ]
})