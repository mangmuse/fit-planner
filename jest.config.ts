import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jsdom",
  clearMocks: true,
  moduleNameMapper: {
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "\\.(css|less)$": "identity-obj-proxy",
  },
};

export default createJestConfig(customJestConfig);
