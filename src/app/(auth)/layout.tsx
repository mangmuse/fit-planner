export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-bg-base flex items-center justify-center">
      <div className="w-full max-w-[390px] px-5">
        {children}
      </div>
    </div>
  );
}