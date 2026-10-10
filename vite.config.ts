import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/line-survey/',
  plugins: [
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Line Survey – Internal',
        short_name: 'Line Survey',
        description: 'Internal field survey application for transmission line design',
        theme_color: '#12b8bd',
        background_color: '#ffffff',
        display: 'standalone',
        icons: []
      }
    })
  ],
  server: { host: true }
})
