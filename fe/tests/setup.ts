import { config } from '@vue/test-utils';
import { beforeEach } from 'vitest';
import vuetify from '../src/plugins/vuetify';

beforeEach(() => {
  config.global.plugins = [vuetify];
});
