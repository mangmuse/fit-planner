export type ApiErrorResponse = {
  success: false;
  message: string;
};

export type ApiSuccessResponse<T = Record<string, unknown>> = {
  success: true;
} & T;
