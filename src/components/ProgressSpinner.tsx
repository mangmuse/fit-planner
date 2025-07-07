type ProgressSpinnerProps = {
  message?: string;
};

const ProgressSpinner = ({ message }: ProgressSpinnerProps) => {
  return (
    <div className="bg-bg-secondary px-8 py-10 rounded-2xl max-w-[280px] w-full border border-border-gray">
      <div className="flex flex-col items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-bg-surface rounded-full" />
          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        {message && (
          <p className="mt-6 text-center text-text-muted text-sm leading-relaxed">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProgressSpinner;