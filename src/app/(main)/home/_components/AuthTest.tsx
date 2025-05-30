"use client";

import { fetchRoutinesFromServer } from "@/api/routine.api";
import {
  overwriteWithServerRoutines,
  syncToServerRoutines,
} from "@/services/routine.service";
import {
  overwriteWithServerRoutineDetails,
  syncToServerRoutineDetails,
} from "@/services/routineDetail.service";
import {
  overWriteAllWithServerData,
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
          overWriteAllWithServerData(userId ?? "");
        }}
      >
        From Server
      </button>
      <button
        onClick={async () => {
          await overwriteWithServerRoutines(userId ?? "");
          await overwriteWithServerRoutineDetails(userId ?? "");
        }}
      >
        루틴만체크
      </button>
    </div>
  );
};

export default AuthTest;
