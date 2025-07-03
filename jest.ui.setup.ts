import "@testing-library/jest-dom";

// 에러 테스트 시 로그 노이즈 방지
global.console = {
  ...console,
  error: jest.fn(),
};

beforeEach(() => {
  expect.hasAssertions();
});

// Mock 기본 React hooks
jest.mock("next-auth/react");
jest.mock("react-error-boundary");
