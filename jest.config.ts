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
    "/node_modules/(?!(p-map|aggregate-error|p-limit|yocto-queue|react-error-boundary))",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^next/image$": "<rootDir>/src/__mocks__/next/Image.tsx",
    "^next/navigation$": "<rootDir>/src/__mocks__/next/navigation.ts",
    "\\.(css|less)$": "<rootDir>/src/__mocks__/styleMock.js",
  },
  // 성능 최적화
  maxWorkers: "50%",
  cache: true,
  cacheDirectory: "<rootDir>/.jest-cache",
  // Watch 모드 최적화
  watchPathIgnorePatterns: [
    "<rootDir>/node_modules/",
    "<rootDir>/.next/",
    "<rootDir>/coverage/",
    "<rootDir>/.jest-cache/",
    "<rootDir>/public/",
    "<rootDir>/prisma/",
    "<rootDir>/.git/"
  ],
  // 테스트 파일 검색 최적화
  testMatch: [
    "**/__tests__/**/*.(test|spec).[jt]s?(x)",
    "**/?(*.)+(test|spec).[jt]s?(x)"
  ],
  // 불필요한 경로 제외
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/coverage/",
    "<rootDir>/dist/"
  ],
  // 메모리 사용량 제한
  workerIdleMemoryLimit: "512MB"
};

export default createJestConfig(customJestConfig);
