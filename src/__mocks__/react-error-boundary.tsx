interface ErrorBoundaryProps {
  children: React.ReactNode;
  FallbackComponent?: React.ComponentType<{ error: Error }>;
  onError?: (error: Error, info: { componentStack: string }) => void;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return <>{children}</>;
};

export const useErrorHandler = () => {
  return (error: Error) => {
    console.error("Error handled:", error);
  };
};

export const withErrorBoundary = (
  Component: React.ComponentType,
  errorBoundaryProps?: ErrorBoundaryProps
) => {
  return Component;
};
