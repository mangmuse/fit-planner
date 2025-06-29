import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  // collectCoverage: true,
  // collectCoverageFrom: ["src/**/*.{js,jsx,ts,tsx}"],
  // coverageDirectory: "coverage",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  testEnvironment: "jest-fixed-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(p-map|aggregate-error|p-limit|yocto-queue)/)",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "^next/navigation$": "<rootDir>/src/__mocks__/next/navigation.ts",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
};

export default createJestConfig(customJestConfig);
