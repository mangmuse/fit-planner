import StartWorkoutSection from "./_components/StartWorkoutSection";
import WorkoutCalendar from "./_components/WorkoutCalendar";

const HomePage = () => {
  return (
    <main className="px-4 ">
      <h1 className="text-primary text-[32px] mb-4">LOGO</h1>
      <StartWorkoutSection />
      <WorkoutCalendar />
    </main>
  );
};

export default HomePage;
