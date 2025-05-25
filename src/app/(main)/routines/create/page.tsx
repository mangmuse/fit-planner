import RoutineForm from "@/app/(main)/routines/_components/RoutineForm";

const CreateRoutinePage = () => {
  return (
    <main className="px-4 pt-[70px]">
      <time className="text-2xl font-semibold">formattedDate</time>
      <RoutineForm />
    </main>
  );
};

export default CreateRoutinePage;
