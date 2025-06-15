/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */

// Composables
import { createApp } from 'vue'

// Plugins
import { registerPlugins } from '@/plugins'

// Components
import App from './App.vue'

// Logger
import { initializeAppLogger } from '@/composables/useLogger'
import { logInfo } from '@/utils/logger'

// Styles
import 'unfonts.css'

const app = createApp(App)

registerPlugins(app)

// Initialize logger before mounting the app
async function initializeApp() {
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
  }
}

// Start the application
initializeApp()
