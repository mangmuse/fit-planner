import { getWorkoutDetails } from "@/api/workout";
import WorkoutContainer from "@/app/(main)/workout/_components/WorkoutContainer";
import WorkoutPlaceholder from "@/app/(main)/workout/_components/WorkoutPlaceholder";
import { authOptions } from "@/app/api/_utils/authOption";
import { getFormattedDateWithoutDay } from "@/util/formatDate";
import { getServerSession } from "next-auth";

type WorkoutPageProps = {
  params: {
    date: string;
  };
};

const WorkoutPage = async ({ params }: WorkoutPageProps) => {
  const { date } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const workoutDetails = await getWorkoutDetails(userId, date);
  const formattedDate = getFormattedDateWithoutDay();
  console.log(workoutDetails);
  return (
    <main className="px-4 pt-[70px]">
      <time className="text-2xl font-semibold">{formattedDate}</time>
      {workoutDetails.length === 0 ? (
        <WorkoutPlaceholder date={date} />
      ) : (
        <WorkoutContainer date={date} workoutDetails={workoutDetails} />
      )}
    </main>
  );
};

export default WorkoutPage;
