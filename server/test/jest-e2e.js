const path = require('path');
const fs = require('fs');

const rootPath = path.resolve(__dirname, '..');

function resolveTsJest() {
  const symlinkPath = path.join(rootPath, 'node_modules', 'ts-jest');
  try {
    const target = fs.readlinkSync(symlinkPath);
    return target.replace(/\\$/, '');
  } catch {
    return symlinkPath;
  }
}

const tsJestPath = resolveTsJest();

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: rootPath,
  testEnvironment: 'node',
  testRegex: '\\.e2e-spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [tsJestPath, { tsconfig: path.join(rootPath, 'tsconfig.json') }],
  },
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/src/$1' },
  testTimeout: 30000,
  globalSetup: '<rootDir>/test/global-setup.ts',
  globalTeardown: '<rootDir>/test/global-teardown.ts',
};
