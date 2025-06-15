import path from 'path';

test('invalid jwt secret fails validation', () => {
  process.env.FCRM_JWT_SECRET = 'short';
  jest.resetModules();
  expect(() => require('../src/utils/config').default).toThrow();
  delete process.env.FCRM_JWT_SECRET;
});
