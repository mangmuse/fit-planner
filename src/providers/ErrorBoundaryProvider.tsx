"use client";

import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/components/ErrorFallback"; // 이전에 만든 Fallback 컴포넌트

export default function ErrorBoundaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error("에러발생 :", error, info);
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
