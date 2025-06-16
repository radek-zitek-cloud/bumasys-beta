/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Logger
import { initializeAppLogger } from '@/composables/useLogger'

// Plugins
import { registerPlugins } from '@/plugins'

import { logInfo } from '@/utils/logger'
// Components
import App from './App.vue'

// Styles
// import './unfonts.css' // TODO: Fix CSS import for tests

const app = createApp(App)

registerPlugins(app)

// Initialize logger before mounting the app
async function initializeApp () {
  console.log('🚀 Bumasys Frontend - Starting Application Initialization...')
  console.log('📊 Environment:', import.meta.env.MODE)
  console.log('🔧 API Base URL:', import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000')
  console.log('🔒 BetterStack Configured:', !!import.meta.env.VITE_BETTERSTACK_TOKEN)

  try {
    logInfo('Starting application initialization...')

    // Initialize logger with backend configuration
    await initializeAppLogger()

    logInfo('Application initialization completed successfully')
  } catch (error) {
    console.warn('Logger initialization failed, continuing with fallback logger:', error)
  } finally {
    // Mount the app regardless of logger initialization status
    app.mount('#app')
    logInfo('Vue application mounted')
    console.log('✅ Vue application successfully mounted to #app')
  }
}

// Start the application
initializeApp()
