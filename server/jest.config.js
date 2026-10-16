const path = require('path');

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [
      path.resolve(__dirname, 'node_modules', 'ts-jest'),
      { tsconfig: path.resolve(__dirname, 'tsconfig.json') },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '\\.module\\.ts$',
    'main\\.ts',
    '\\.dto\\.ts$',
    '\\.entity\\.ts$',
  ],
  coverageThreshold: {
    global: { lines: 80 },
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
  },
};
