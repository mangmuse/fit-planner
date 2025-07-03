import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  displayName: "dialog",
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.ui.setup.ts"],
  clearMocks: true,
  testEnvironment: "jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(p-map|aggregate-error|p-limit|yocto-queue|react-error-boundary))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "^next/navigation$": "<rootDir>/src/__mocks__/next/navigation.ts",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  testMatch: [
    "**/ModalProvider.spec.{ts,tsx}",
    "**/BottomSheetProvider.spec.{ts,tsx}",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/dist/",
  ],
};

export default createJestConfig(customJestConfig);
