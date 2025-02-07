import { getAllExercises } from "@/api/exercise";
import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { authOptions } from "@/app/api/_utils/authOption";
import { getServerSession } from "next-auth";
import { DefaultSession } from "next-auth";

export const revalidate = 86400;

const ExercisesPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const exercises = await getAllExercises(userId);
  console.log(exercises);
  return (
    <>
      <ExercisesContainer />
    </>
  );
};
export default ExercisesPage;
