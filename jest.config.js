// jest.config.js
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]s$': 'babel-jest'
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'API Test Report',
      outputPath: 'test-report.html',
      includeFailureMsg: true,
      includeConsoleLog: true,
      dateFormat: 'yyyy-mm-dd HH:MM:ss',
      styleOverridePath: './test-report-style.css'
    }]
  ],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'html', 'lcov'],
  testMatch: [
    '**/__tests__/**/*.test.js',
    '**/?(*.)+(spec|test).js'
  ],
  moduleFileExtensions: ['js', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!(node-fetch)/)'
  ]
};