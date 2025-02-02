"use client";

import { signIn, signOut, useSession } from "next-auth/react";

const AuthTest = () => {
  const { status } = useSession();
  const handleSignIn = () => signIn("google");
  const handleSignOut = () => signOut();
  console.log(status);
  return (
    <div className="flex gap2 mt-10">
      {status === "authenticated" ? (
        <button className="px-3 py-2 bg-red-500" onClick={handleSignOut}>
          로그아웃
        </button>
      ) : (
        <button className="px-3 py-2 bg-blue-500" onClick={handleSignIn}>
          로그인
        </button>
      )}
    </div>
  );
};

export default AuthTest;
