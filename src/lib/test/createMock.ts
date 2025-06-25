import { cloneDeep, set } from "lodash";

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export function createMock<T extends object>(
  defaultObject: T,
  overrides: { [key: string]: unknown } = {}
): T {
  const mockObject = cloneDeep(defaultObject);

  Object.keys(overrides).forEach((path) => {
    set(mockObject, path, overrides[path]);
  });

  return mockObject;
}
