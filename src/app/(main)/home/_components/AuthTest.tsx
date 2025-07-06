"use client";

import { routineDetailService, routineService, syncAllService } from "@/lib/di";

import { signIn, signOut, useSession } from "next-auth/react";

const AuthTest = () => {
  const { data, status } = useSession();
  const userId = data?.user?.id;
  const handleSignIn = () => signIn("google");
  const handleSignOut = () => signOut();
  return (
    <div className="fixed bottom-24 right-4 flex flex-col gap-2 p-2 bg-bg-surface rounded-lg shadow-lg opacity-50 hover:opacity-100 transition-opacity">
      {status === "authenticated" ? (
        <button
          className="px-3 py-1.5 bg-red-500 text-xs rounded"
          onClick={handleSignOut}
        >
          로그아웃
        </button>
      ) : (
        <button
          className="px-3 py-1.5 bg-blue-500 text-xs rounded"
          onClick={handleSignIn}
        >
          로그인
        </button>
      )}
      <button
        className="px-2 py-1 bg-bg-secondary text-xs rounded"
        onClick={() => {
          syncAllService.overWriteToServer(userId ?? "");
        }}
      >
        To Server
      </button>
      <button
        className="px-2 py-1 bg-bg-secondary text-xs rounded"
        onClick={() => {
          syncAllService.overWriteAllWithServerData(userId ?? "");
        }}
      >
        From Server
      </button>
      <button
        className="px-2 py-1 bg-bg-secondary text-xs rounded"
        onClick={async () => {
          await routineService.overwriteWithServerRoutines(userId ?? "");
          await routineDetailService.overwriteWithServerRoutineDetails(
            userId ?? ""
          );
        }}
      >
        루틴만체크
      </button>
    </div>
  );
};

export default AuthTest;
