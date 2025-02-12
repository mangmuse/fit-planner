import { HttpError } from "@/app/api/_utils/handleError";
import { ZodError, ZodSchema } from "zod";

export type ZodSafeParseReturn<T> =
  | { success: true; data: T }
  | { success: false; error: ZodError };

export const VALIDATION_FAILED = "Validation failed";

export const validateData = <T>(schema: ZodSchema<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  } else {
    const errorMessages = result.error.issues
      .map((issue) => issue.message)
      .join(", ");
    throw new HttpError(`${VALIDATION_FAILED}: ${errorMessages}`, 422);
  }
};
