import path from 'path';

test('invalid jwt secret fails validation', () => {
  process.env.JWT_SECRET = 'short';
  jest.resetModules();
  expect(() => require('../src/config').default).toThrow();
  delete process.env.JWT_SECRET;
});
