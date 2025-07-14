"use client";

import { signIn } from "next-auth/react";

import Image from "next/image";

interface SocialLoginButtonsProps {
  onGoogleLogin?: () => void;
  onKakaoLogin?: () => void;
}

export default function SocialLoginButtons({
  onGoogleLogin,
  onKakaoLogin,
}: SocialLoginButtonsProps) {
  const handleSignIn = () => signIn("google", { callbackUrl: "/" });
  return (
    <div className="space-y-3">
      <button
        onClick={handleSignIn}
        className="w-full py-4 bg-white text-gray-800 font-medium rounded-2xl flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm"
      >
        <Image src="/icons/google.svg" alt="Google" width={22} height={22} />
        <span className="text-base">Google로 로그인</span>
      </button>

      <button
        onClick={onKakaoLogin}
        disabled
        className="w-full py-4 bg-[#FEE500] text-gray-900 font-medium rounded-2xl flex items-center justify-center gap-3 hover:bg-[#FDD835] transition-all shadow-sm"
      >
        <Image src="/icons/kakao.svg" alt="Kakao" width={22} height={22} />
        <span className="text-base">카카오로 로그인</span>
      </button>
    </div>
  );
}
