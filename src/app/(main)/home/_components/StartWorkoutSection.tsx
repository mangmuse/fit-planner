import { getFormattedDate, getFormattedDateYMD } from "@/util/formatDate";
import Link from "next/link";

const StartWorkoutSection = () => {
  const formattedDate = getFormattedDate();
  const today = getFormattedDateYMD();
  return (
    <section className="flex flex-col justify-between p-[18px] mb-[27px] w-full h-32 rounded-[20px] bg-bg-surface ">
      <p className="text-lg">{formattedDate}</p>
      <Link
        href={`/workout/${today}`}
        className="flex text-lg justify-center items-center w-full font-semibold h-[49px] rounded-2xl bg-primary text-text-black"
      >
        오늘의 운동 시작하기
      </Link>
    </section>
  );
};

export default StartWorkoutSection;
