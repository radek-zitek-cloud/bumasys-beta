import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'

beforeEach(() => {
  config.global.stubs = {
    // Stub Vuetify components to avoid CSS import issues
    'v-card': true,
    'v-card-title': true,
    'v-card-text': true,
    'v-card-actions': true,
    'v-text-field': true,
    'v-textarea': true,
    'v-btn': true,
    'v-spacer': true,
    'v-row': true,
    'v-col': true,
    'v-icon': true,
    'v-select': true,
  }
})
