const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: [
    '<rootDir>/__tests__/**/*.test.(js|jsx|ts|tsx)',
    '<rootDir>/src/**/__tests__/**/*.test.(js|jsx|ts|tsx)',
  ],
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/__mocks__/',
    '<rootDir>/__tests__/__fixtures__/',
  ],
}

module.exports = createJestConfig(customJestConfig)