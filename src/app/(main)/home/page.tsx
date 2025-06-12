import StartWorkoutSection from "./_components/StartWorkoutSection";
import { signIn } from "next-auth/react";
import WorkoutCalendar from "./_components/WorkoutCalendar";
import AuthTest from "@/app/(main)/home/_components/AuthTest";

const HomePage = () => {
  return (
    <main className="px-4 pt-12 pb-20">
      <h1 className="text-primary text-2xl font-bold mb-6">FIT PLANNER</h1>
      <StartWorkoutSection />
      <WorkoutCalendar />
      <AuthTest />
    </main>
  );
};

export default HomePage;
