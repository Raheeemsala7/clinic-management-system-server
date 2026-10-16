const path = require('path');
const fs = require('fs');

// Resolve ts-jest through the pnpm symlink's real target directory.
// The symlink at node_modules/ts-jest is a junction that Node's require()
// cannot follow on Windows without resolving through lstat + readlink.
function resolveTsJest() {
  const symlinkPath = path.join(__dirname, 'node_modules', 'ts-jest');
  try {
    const target = fs.readlinkSync(symlinkPath);
    // target is an absolute Windows path like D:\...\ts-jest\
    return target.replace(/\\$/, ''); // strip trailing backslash
  } catch {
    // Fallback for non-pnpm installs
    return symlinkPath;
  }
}

const tsJestPath = resolveTsJest();

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': [tsJestPath, { tsconfig: path.join(__dirname, 'tsconfig.json') }],
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
  coverageThreshold: { global: { lines: 80 } },
  testEnvironment: 'node',
  moduleNameMapper: { '^src/(.*)$': '<rootDir>/$1' },
};
