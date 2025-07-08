"use client";
import { ReactNode, useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";
import { exerciseService } from "@/lib/di";

const ExercisePrefetcher = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();

  useEffect(() => {
    const userId = session?.user?.id;
    let isCancelled = false;

    if (status === "authenticated" && userId) {
      const prefetchExercises = async () => {
        try {
          if (!isCancelled) {
            await exerciseService.syncFromServerIfNeeded(userId);
          }
        } catch (error) {
          console.error(
            "[ExercisePrefetcher] Failed to prefetch exercises:",
            error
          );
        }
      };

      prefetchExercises();
    }
    return () => {
      isCancelled = true;
    };
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
