module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["@testing-library/jest-dom"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  testMatch: [
    "**/__tests__/**/*.spec.ts?(x)",
    "**/__tests__/**/*.test.ts?(x)"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", {}],
  },
};
