"use client";
import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { exerciseService } from "@/lib/di";

const ExercisePrefetcher = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const userId = session?.user?.id;

    if (status === "authenticated" && userId) {
      const prefetchExercises = async () => {
        try {
          await exerciseService.syncFromServerIfNeeded(userId);
        } catch (error) {
          console.error(
            "[ExercisePrefetcher] Failed to prefetch exercises:",
            error
          );
        }
      };

      prefetchExercises();
    }
  }, [status, session?.user?.id]);

  return <>{children}</>;
};

const SessionProviderWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <ExercisePrefetcher>{children}</ExercisePrefetcher>
    </SessionProvider>
  );
};

export default SessionProviderWrapper;
