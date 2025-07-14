import StartWorkoutSection from "./_components/StartWorkoutSection";
import WorkoutCalendar from "./_components/WorkoutCalendar";

export const dynamic = "force-dynamic";

const HomePage = () => {
  return (
    <main className="px-4 pt-12 pb-20">
      <h1 className="text-primary text-2xl font-bold mb-6">FIT PLANNER</h1>
      <StartWorkoutSection />
      <WorkoutCalendar />
    </main>
  );
};

export default HomePage;
