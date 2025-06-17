import SocialLoginButtons from "@/components/auth/SocialLoginButtons";

export default function LoginPage() {
  return (
    <div className="w-full">
      {/* 로고 및 타이틀 */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-primary mb-2">FIT PLANNER</h1>
        <p className="text-text-muted text-lg">운동 기록을 더 쉽고 빠르게</p>
      </div>

      {/* 소셜 로그인 */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium text-text-white text-center mb-4">
          간편하게 시작하기
        </h2>
        <SocialLoginButtons />
      </div>
    </div>
  );
}
