import { handlers } from "@/__mocks__/src/api/handlers";
import "@testing-library/jest-dom";
import "fake-indexeddb/auto";
import { setupServer } from "msw/node";
import { ZodError } from "zod";

export const server = setupServer(...handlers);

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
    workout: { findMany: jest.fn(), upsert: jest.fn() },
    workoutDetail: { findMany: jest.fn() },
    routineDetail: { findMany: jest.fn() },
  },
}));
