/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

import { setupLayouts } from 'virtual:generated-layouts'
// Composables
// ESLint marks these imports as duplicates because the auto imports resolve to
// the same file paths during build. Disable the rule for these lines.
// eslint-disable-next-line import/no-duplicates
import { createRouter, createWebHistory } from 'vue-router/auto'
// eslint-disable-next-line import/no-duplicates
import { routes } from 'vue-router/auto-routes'
import { logInfo, logError, logWarn, logDebug } from '../utils/logger'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: setupLayouts(routes),
})

// Add navigation logging
router.beforeEach((to, from, next) => {
  logDebug('Router navigation started', {
    from: from.path,
    to: to.path,
    name: to.name
  })
  next()
})

router.afterEach((to, from) => {
  logInfo('Router navigation completed', {
    from: from.path,
    to: to.path,
    name: to.name
  })
})

// Workaround for https://github.com/vitejs/vite/issues/11804
router.onError((err, to) => {
  if (err?.message?.includes?.('Failed to fetch dynamically imported module')) {
    if (localStorage.getItem('vuetify:dynamic-reload')) {
      logError('Dynamic import error, reloading page did not fix it', err)
    } else {
      logWarn('Reloading page to fix dynamic import error', { error: err.message })
      localStorage.setItem('vuetify:dynamic-reload', 'true')
      location.assign(to.fullPath)
    }
  } else {
    logError('Router error occurred', err)
  }
})

router.isReady().then(() => {
  localStorage.removeItem('vuetify:dynamic-reload')
  logInfo('Router is ready')
})

export default router
