import { handlers } from "@/__mocks__/api/handlers";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";

export const server = setupServer(...handlers);

beforeEach(() => {
  expect.hasAssertions();
});

beforeAll(() => {
  server.listen();
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
