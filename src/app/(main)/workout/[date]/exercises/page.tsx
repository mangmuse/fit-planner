import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";

export const revalidate = 86400;

const ExercisesPage = async () => {
  return (
    <>
      <ExercisesContainer type="RECORD" allowMultipleSelection />
    </>
  );
};
export default ExercisesPage;
