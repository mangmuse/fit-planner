import { ZodError, ZodSchema } from "zod";

export type ZodSafeParseReturn<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

export const validateData = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  } else {
    const errorMessages = result.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw new Error(`Response Validation failed: ${errorMessages}`);
  }
};
