import { z } from "zod";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function safeRequest<T>(
  url: string,
  options: RequestInit,
  schema: z.ZodSchema<T>
): Promise<T> {
  const res = await fetch(url, options);

  if (!res.ok) {
    let errorMessage = `요청 실패 (${res.status})`;
    try {
      const errorBody = await res.json();
      if (errorBody.message) {
        errorMessage = errorBody.message;
      }
    } catch {}

    throw new ApiError(res.status, errorMessage);
  }

  const data = await res.json();

  return schema ? schema.parse(data) : data;
}
