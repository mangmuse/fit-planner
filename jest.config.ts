import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  clearMocks: true,
  testEnvironment: "jest-fixed-jsdom",
  transformIgnorePatterns: [
    "/node_modules/(?!(p-map|aggregate-error|p-limit|yocto-queue|react-error-boundary))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "^next/navigation$": "<rootDir>/src/__mocks__/next/navigation.ts",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/dist/",
    "<rootDir>/src/components/Dialog/BottomSheet/BottomSheetProvider.spec.tsx",
    "<rootDir>/src/components/Dialog/Modal/ModalProvider.spec.tsx",
  ],
};

export default createJestConfig(customJestConfig);
