import RoutineForm from "@/app/(main)/routines/_components/routineForm/RoutineForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/_utils/authOption";
import { redirect } from "next/navigation";
import { routineDetailService } from "@/lib/di";

const RoutineFormPage = async ({
  params,
}: {
  params: Promise<{
    routineId: string;
  }>;
}) => {
  const { routineId } = await Promise.resolve(params);
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="px-4 pt-12 pb-20">
      <RoutineForm userId={userId} routineId={Number(routineId)} />
    </main>
  );
};

export default RoutineFormPage;
