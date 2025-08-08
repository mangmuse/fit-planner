import ExercisesContainer from "@/app/(main)/workout/[date]/exercises/_components/ExercisesContainer";
import { authOptions } from "@/app/api/_utils/authOption";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const ExercisesPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <>
      <ExercisesContainer
        type="RECORD"
        userId={userId}
        allowMultipleSelection
      />
    </>
  );
};
export default ExercisesPage;
