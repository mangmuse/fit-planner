export type SettingsItemProps = {
  title: string;
  description?: string;
  onClick?: () => void;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export const SettingsItem = ({ 
  title, 
  description, 
  onClick, 
  className = "",
  icon,
  disabled,
}: SettingsItemProps) => {
  const content = (
    <div className="flex items-center gap-3 px-4 py-3">
      {icon && (
        <div className={`text-text-muted ${disabled ? 'opacity-50' : ''}`}>
          {icon}
        </div>
      )}
      <div className="flex-1">
        <p className={`text-white ${className} ${disabled ? 'opacity-50' : ''}`}>{title}</p>
        {description && (
          <p className={`text-text-muted text-sm ${disabled ? 'opacity-50' : ''}`}>{description}</p>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full text-left hover:bg-bg-secondary transition-colors ${
          disabled ? 'cursor-not-allowed' : ''
        }`}
      >
        {content}
      </button>
    );
  }

  return <div>{content}</div>;
};