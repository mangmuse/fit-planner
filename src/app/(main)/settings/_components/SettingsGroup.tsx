type SettingsGroupProps = {
  title: string;
  children: React.ReactNode;
};

export const SettingsGroup = ({ title, children }: SettingsGroupProps) => {
  return (
    <section>
      <h2 className="text-sm font-semibold text-text-muted px-2 pb-2">
        {title}
      </h2>
      <div className="bg-bg-surface rounded-lg overflow-hidden">{children}</div>
    </section>
  );
};
