module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  },
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest", { tsconfig: "./tsconfig.json" }]
  },
  testMatch: ["**/__tests__/**/*.spec.(ts|tsx)"]
};
