import { config } from '@vue/test-utils'
import { beforeEach } from 'vitest'

beforeEach(() => {
  config.global.stubs = {
    // Stub Vuetify components to avoid CSS import issues but preserve content
    'v-card': {
      template: '<div class="v-card"><slot /></div>'
    },
    'v-card-title': {
      template: '<div class="v-card-title"><slot /></div>'
    },
    'v-card-text': {
      template: '<div class="v-card-text"><slot /></div>'
    },
    'v-card-actions': {
      template: '<div class="v-card-actions"><slot /></div>'
    },
    'v-text-field': {
      template: '<div class="v-text-field">{{ modelValue }}</div>',
      props: ['modelValue', 'label', 'prependIcon', 'readonly']
    },
    'v-textarea': {
      template: '<div class="v-textarea">{{ modelValue }}</div>',
      props: ['modelValue', 'label', 'prependIcon', 'readonly', 'rows']
    },
    'v-btn': {
      template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>',
      emits: ['click']
    },
    'v-spacer': {
      template: '<div class="v-spacer"></div>'
    },
    'v-row': {
      template: '<div class="v-row"><slot /></div>'
    },
    'v-col': {
      template: '<div class="v-col"><slot /></div>',
      props: ['cols']
    },
    'v-icon': {
      template: '<span class="v-icon">{{ icon }}</span>',
      props: ['icon']
    },
    'v-select': {
      template: '<div class="v-select">{{ modelValue }}</div>',
      props: ['modelValue', 'items', 'label']
    },
    'v-chip': {
      template: '<span class="v-chip"><slot /></span>',
      props: ['color', 'size', 'variant', 'prependIcon']
    },
    'v-dialog': {
      template: '<div class="v-dialog" v-if="modelValue"><slot /></div>',
      props: ['modelValue']
    },
    'v-container': {
      template: '<div class="v-container"><slot /></div>'
    },
    'v-divider': {
      template: '<hr class="v-divider" />'
    },
    // Additional stubs
    'v-app': {
      template: '<div class="v-app"><slot /></div>'
    },
    'v-main': {
      template: '<main class="v-main"><slot /></main>'
    },
    'v-navigation-drawer': {
      template: '<nav class="v-navigation-drawer"><slot /></nav>'
    },
    'v-app-bar': {
      template: '<header class="v-app-bar"><slot /></header>'
    },
    'v-toolbar': {
      template: '<div class="v-toolbar"><slot /></div>'
    },
    'v-list': {
      template: '<div class="v-list"><slot /></div>'
    },
    'v-list-item': {
      template: '<div class="v-list-item"><slot /></div>'
    },
    'v-list-item-title': {
      template: '<div class="v-list-item-title"><slot /></div>'
    },
    'v-menu': {
      template: '<div class="v-menu"><slot /></div>'
    },
    'v-sheet': {
      template: '<div class="v-sheet"><slot /></div>'
    },
    'v-form': {
      template: '<form class="v-form"><slot /></form>'
    },
    'v-checkbox': {
      template: '<input type="checkbox" class="v-checkbox" />',
      props: ['modelValue']
    },
    'v-switch': {
      template: '<input type="checkbox" class="v-switch" />',
      props: ['modelValue']
    },
    'v-radio': {
      template: '<input type="radio" class="v-radio" />',
      props: ['value']
    },
    'v-radio-group': {
      template: '<div class="v-radio-group"><slot /></div>',
      props: ['modelValue']
    },
    'v-tabs': {
      template: '<div class="v-tabs"><slot /></div>'
    },
    'v-tab': {
      template: '<button class="v-tab"><slot /></button>'
    },
    'v-window': {
      template: '<div class="v-window"><slot /></div>'
    },
    'v-window-item': {
      template: '<div class="v-window-item"><slot /></div>'
    },
    'v-data-table': {
      template: '<table class="v-data-table"><slot /></table>'
    },
    'v-snackbar': {
      template: '<div class="v-snackbar"><slot /></div>'
    },
    'v-alert': {
      template: '<div class="v-alert"><slot /></div>'
    },
    'v-progress-circular': {
      template: '<div class="v-progress-circular"></div>'
    },
    'v-progress-linear': {
      template: '<div class="v-progress-linear"></div>'
    },
    'v-skeleton-loader': {
      template: '<div class="v-skeleton-loader"></div>'
    },
    'router-link': {
      template: '<a class="router-link"><slot /></a>',
      props: ['to']
    },
    'router-view': {
      template: '<div class="router-view"><slot /></div>'
    },
  }
})
