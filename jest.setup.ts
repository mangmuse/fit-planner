import { handlers } from "@/__mocks__/src/api/handlers";
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { setupServer } from "msw/node";
import { ZodError } from "zod";

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
