import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  testEnvironment: "jest-fixed-jsdom",

  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "^next/navigation$": "<rootDir>/src/__mocks__/next/navigation.ts",
    "\\.(css|less)$": "identity-obj-proxy",
  },
};

export default createJestConfig(customJestConfig);
