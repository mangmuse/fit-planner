"use client";

import { fetchRoutinesFromServer } from "@/api/routine.api";
import {
  overwriteWithServerRoutines,
  syncToServerRoutines,
} from "@/services/routine.service";
import { syncToServerRoutineDetails } from "@/services/routineDetail.service";
import {
  overWriteAllWithWerverData,
  syncToServer,
} from "@/services/syncAll.service";
import { signIn, signOut, useSession } from "next-auth/react";

const AuthTest = () => {
  const { data, status } = useSession();
  const userId = data?.user?.id;
  const handleSignIn = () => signIn("google");
  const handleSignOut = () => signOut();
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
      <button
        onClick={() => {
          syncToServer(userId ?? "");
        }}
      >
        To Server
      </button>
      <button
        onClick={() => {
          overWriteAllWithWerverData(userId ?? "");
        }}
      >
        From Server
      </button>
      <button
        onClick={async () => {
          await syncToServerRoutines();
          await syncToServerRoutineDetails();
        }}
      >
        루틴만체크
      </button>
    </div>
  );
};

export default AuthTest;
