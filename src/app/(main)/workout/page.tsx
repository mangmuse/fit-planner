import { getFormattedDateWithoutDay } from "@/util/formatDate";
import Link from "next/link";

const WorkoutPage = () => {
  const formattedDate = getFormattedDateWithoutDay();
  return (
    <main className="pt-[70px]">
      <time className="text-2xl font-semibold">{formattedDate}</time>
      <div className="flex flex-col mt-6 gap-3 ">
        <Link
          href="/"
          className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
        >
          나의 루틴 가져오기
        </Link>
        <Link
          href="/workout/exercises"
          className="flex justify-center items-center w-full h-[47px] font-bold rounded-2xl bg-primary text-text-black"
        >
          운동 추가하기
        </Link>
      </div>
    </main>
  );
};

export default WorkoutPage;
