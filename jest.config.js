module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/src/$1'
  }
}
