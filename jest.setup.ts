import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { ZodError } from "zod";

import { mockDI } from "@/__mocks__/lib/di";
import { handlers } from "@/__mocks__/src/api/handlers";
import { setupServer } from "msw/node";

export const server = setupServer(...handlers);

// 에러 테스트 시 로그 노이즈 방지
global.console = {
  ...console,
  error: jest.fn(),
};

beforeEach(() => {
  expect.hasAssertions();
});

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
  jest.restoreAllMocks();
});

afterAll(() => {
  server.close();
});

jest.mock("@/lib/prisma", () => ({
  prisma: {
    exercise: { findMany: jest.fn() },
    routine: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    workout: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      upsert: jest.fn(),
    },
    workoutDetail: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    routineDetail: {
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock("@/lib/di", () => mockDI);

jest.mock("next-auth/react");

jest.mock("@/providers/contexts/BottomSheetContext", () => ({
  useBottomSheet: jest.fn(() => ({
    openBottomSheet: jest.fn(),
    closeBottomSheet: jest.fn(),
    isOpen: false,
  })),
}));

jest.mock("@/providers/contexts/ModalContext", () => ({
  useModal: jest.fn(() => ({
    openModal: jest.fn(),
    closeModal: jest.fn(),
    showError: jest.fn(),
    isOpen: false,
  })),
}));

jest.mock("react-error-boundary");

jest.mock("@/providers/ErrorBoundaryProvider", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));
