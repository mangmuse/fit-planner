import nextJest from "next/jest";
const createJestConfig = nextJest({
  dir: "./",
});
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  clearMocks: true,
  transform: {
    "\\.css\\.ts$": "@vanilla-extract/jest-transform",
  },
  moduleNameMapper: {
    "my-css-folder/.*\\.css$": "<rootDir>/styleMock.js",
    "\\.legacy\\.css$": "<rootDir>/styleMock.js",
  },
};

export default createJestConfig(customJestConfig);
