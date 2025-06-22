import type { FallbackProps } from "react-error-boundary";

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
  console.error("ErrorBoundary가 잡은 렌더링 에러:", error);
  const userFriendlyMessage = "요청을 처리하는 중 문제가 발생했습니다.";
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-4">
      <p className="text-red-500">{userFriendlyMessage}</p>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        다시 시도
      </button>
    </div>
  );
};

export default ErrorFallback;
