const path = require('path');
const rootPath = path.resolve(__dirname, '..');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: rootPath,
  testEnvironment: 'node',
  testRegex: '.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      path.resolve(rootPath, 'node_modules', 'ts-jest'),
      { tsconfig: path.resolve(rootPath, 'tsconfig.json') },
    ],
  },
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
};
