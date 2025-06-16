const ErrorState = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => Promise<void>;
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-40 gap-4">
      <p className="text-red-500">{error}</p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-primary text-white rounded-lg"
      >
        다시 시도
      </button>
    </div>
  );
};

export default ErrorState;
