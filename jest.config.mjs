/**
 * @file jest.config.mjs
 * @description SWC-basiertes Jest-Setup für die React-Komponenten- und Hook-Tests.
 */

export default {
  testEnvironment: "jsdom",
  /**
   * Limiting Jest to a single worker avoids sporadic crashes of the @swc/jest
   * transformer that occurred when multiple child processes were spawned in
   * this environment.
   */
  maxWorkers: 1,
  transform: {
    "^.+\\.(js|jsx)$": [
      "@swc/jest",
      {
        jsc: {
          parser: {
            syntax: "ecmascript",
            jsx: true
          },
          transform: {
            react: {
              runtime: "automatic",
              development: process.env.NODE_ENV === "test"
            }
          },
          target: "es2019"
        },
        module: {
          type: "es6"
        }
      }
    ]
  },
  moduleNameMapper: {
    "\\.(css|less|sass|scss)$": "identity-obj-proxy",
    "\\.(png|jpg|jpeg|gif|svg|webp|avif)$": "<rootDir>/__mocks__/fileMock.js"
  },
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  testMatch: ["<rootDir>/tests/**/*.test.{js,jsx}"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/hooks/useEntriesManager.js",
    "!src/**/index.{js,jsx}"
  ],
  coverageThreshold: {
    global: { statements: 80, branches: 70, functions: 75, lines: 80 }
  },
  extensionsToTreatAsEsm: [".jsx"]
};
