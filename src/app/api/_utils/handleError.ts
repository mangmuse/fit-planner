import { NextResponse } from "next/server";

export class HttpError extends Error {
  public status: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "HttpError";
    this.status = statusCode;

    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

export function handleServerError(e: unknown) {
  console.error("[Server Error]", e);
  if (e instanceof HttpError) {
    return NextResponse.json(
      { success: false, message: e.message },
      { status: e.status }
    );
  }
  return NextResponse.json(
    { success: false, message: "예상치 못한 서버 에러" },
    { status: 500 }
  );
}
