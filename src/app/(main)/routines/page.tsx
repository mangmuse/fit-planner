import RoutinesContainer from "@/app/(main)/routines/_components/RoutinesContainer";
import { authOptions } from "@/app/api/_utils/authOption";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const RoutinesPage = async () => {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  return (
    <main className="px-4 pt-12 pb-20">
      <h1 className="text-2xl font-bold mb-6">루틴 관리</h1>
      <RoutinesContainer userId={userId} />
    </main>
  );
};

export default RoutinesPage;
