/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};
