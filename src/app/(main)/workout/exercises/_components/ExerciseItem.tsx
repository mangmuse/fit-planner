import { Exercise } from "@prisma/client";
import Image from "next/image";
import favoriteIcon from "public/favorite.svg";

type ExerciseItem = { exercise: Exercise };

const ExerciseItem = ({ exercise }: ExerciseItem) => {
  return (
    <li className="px-3 flex justify-between w-full h-[51px] rounded-lg bg-bg-surface">
      <div className="flex items-center gap-5">
        <div className="bg-slate-300 w-8 h-8">
          {/* <Image src={favoriteIcon} alt="운동 이미지" /> */}
        </div>
        <span>{exercise.name}</span>
      </div>
      <Image src={favoriteIcon} alt="즐겨찾기" />
    </li>
  );
};

export default ExerciseItem;
