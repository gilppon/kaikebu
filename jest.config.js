/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.(ts|tsx|js|jsx)$": ["ts-jest", {
      tsconfig: "tsconfig.json",
      useESM: true
    }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(uuid)/)"
  ],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
};