import StartWorkoutSection from "./_components/StartWorkoutSection";
import { signIn } from "next-auth/react";
import WorkoutCalendar from "./_components/WorkoutCalendar";
import AuthTest from "@/app/(main)/home/_components/AuthTest";

const HomePage = () => {
  return (
    <main className="px-4 ">
      <h1 className="text-primary text-[32px] mb-4">LOGO</h1>
      <StartWorkoutSection />
      <WorkoutCalendar />
      <AuthTest />
    </main>
  );
};

export default HomePage;
