/**
 * plugins/vuetify.ts
 *
 * Framework documentation: https://vuetifyjs.com`
 */

// https://vuetifyjs.com/en/introduction/why-vuetify/#feature-guides
import { createVuetify } from 'vuetify'

// Styles
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'

const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          'background': '#edefe6',
          'surface': '#f9faf1',
          'surface-dim': '#d9dbd2',
          'surface-bright': '#f9faf1',
          'surface-container-lowest': '#ffffff',
          'surface-container-low': '#f3f4ec',
          'surface-container': '#edefe6',
          'surface-container-high': '#e8e9e0',
          'surface-container-highest': '#e2e3db',
          'on-surface': '#1a1c17',
          'inverse-surface': '#2f312c',
          'inverse-on-surface': '#f0f1e9',
          'outline': '#73796c',
          'outline-variant': '#c2c9ba',
          'primary': '#40682c',
          'on-primary': '#ffffff',
          'primary-container': '#c0f0a4',
          'on-primary-container': '#072100',
          'inverse-primary': '#a5d48a',
          'secondary': '#656104',
          'on-secondary': '#ffffff',
          'secondary-container': '#ece681',
          'on-secondary-container': '#1e1c00',
          'tertiary': '#006c4f',
          'on-tertiary': '#ffffff',
          'tertiary-container': '#9df4cf',
          'on-tertiary-container': '#002116',
          'error': '#ba1a1a',
          'on-error': '#ffffff',
          'error-container': '#ffdad6',
          'on-error-container': '#410002',
          'primary-fixed': '#c0f0a4',
          'primary-fixed-dim': '#a5d48a',
          'on-primary-fixed': '#072100',
          'on-primary-fixed-variant': '#285016',
          'secondary-fixed': '#ece681',
          'secondary-fixed-dim': '#d0ca69',
          'on-secondary-fixed': '#1e1c00',
          'on-secondary-fixed-variant': '#4c4900',
          'tertiary-fixed': '#9df4cf',
          'tertiary-fixed-dim': '#82d7b4',
          'on-tertiary-fixed': '#002116',
          'on-tertiary-fixed-variant': '#00513b',
          'surface-light': '#e8e9e0',
        },
        dark: false,
        variables: {
          'overlay-background': '#171d14',
        },
      },
      dark: {
        colors: {
          'background': '#1e201b',
          'surface': '#11140f',
          'surface-dim': '#11140f',
          'surface-bright': '#373a34',
          'surface-container-lowest': '#0c0f0a',
          'surface-container-low': '#1a1c17',
          'surface-container': '#1e201b',
          'surface-container-high': '#282b25',
          'surface-container-highest': '#333630',
          'on-surface': '#e2e3db',
          'inverse-surface': '#e2e3db',
          'inverse-on-surface': '#2f312c',
          'outline': '#8c9385',
          'outline-variant': '#42493d',
          'primary': '#a5d48a',
          'on-primary': '#113801',
          'primary-container': '#285016',
          'on-primary-container': '#c0f0a4',
          'inverse-primary': '#40682c',
          'secondary': '#d0ca69',
          'on-secondary': '#343200',
          'secondary-container': '#4c4900',
          'on-secondary-container': '#ece681',
          'tertiary': '#82d7b4',
          'on-tertiary': '#003827',
          'tertiary-container': '#00513b',
          'on-tertiary-container': '#9df4cf',
          'error': '#ffb4ab',
          'on-error': '#690005',
          'error-container': '#93000a',
          'on-error-container': '#ffb4ab',
          'primary-fixed': '#c0f0a4',
          'primary-fixed-dim': '#a5d48a',
          'on-primary-fixed': '#072100',
          'on-primary-fixed-variant': '#285016',
          'secondary-fixed': '#ece681',
          'secondary-fixed-dim': '#d0ca69',
          'on-secondary-fixed': '#1e1c00',
          'on-secondary-fixed-variant': '#4c4900',
          'tertiary-fixed': '#9df4cf',
          'tertiary-fixed-dim': '#82d7b4',
          'on-tertiary-fixed': '#002116',
          'on-tertiary-fixed-variant': '#00513b',
          'surface-light': '#373a34',
        },
        dark: true,
        variables: {
          'overlay-background': '#171d14',
        },
      },
    },
  },

})

export default vuetify
