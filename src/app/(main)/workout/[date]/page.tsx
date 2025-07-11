import SessionContainer from "@/app/(main)/_shared/session/SessionContainer";
import { authOptions } from "@/app/api/_utils/authOption";
import { getFormattedDateWithoutDay } from "@/util/formatDate";
import { getServerSession } from "next-auth";

type WorkoutPageProps = {
  params: Promise<{
    date: string;
  }>;
};

const WorkoutPage = async ({ params }: WorkoutPageProps) => {
  const { date } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  // const workoutDetails = await getWorkoutDetails(userId, date);
  const formattedDate = getFormattedDateWithoutDay(date);
  return (
    <main className="px-4 pt-12 pb-20 scrollbar-none">
      <SessionContainer
        type="RECORD"
        date={date}
        formattedDate={formattedDate}
      />
    </main>
  );
};

export default WorkoutPage;
