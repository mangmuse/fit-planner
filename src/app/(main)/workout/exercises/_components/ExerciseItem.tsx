import useExerciseMutation from "@/hooks/api/mutation/useExerciseMutation";
import { useModal } from "@/providers/contexts/ModalContext";
import { ExerciseQueryParams } from "@/types/dto/exercise.dto";
import { ClientExerise, ClientUser } from "@/types/models";
import clsx from "clsx";
import Image from "next/image";
import favoriteIcon from "public/favorite.svg";
import filledFavoriteIcon from "public/favorite_filled.svg";
import { useState } from "react";

type ExerciseItem = {
  exercise: ClientExerise;
  isSelected: boolean;
  onAdd: (newId: ClientExerise["id"]) => void;
  onDelete: (toBeDeleted: ClientExerise["id"]) => void;
  userId: ClientUser["id"];
  queryOptions?: Omit<ExerciseQueryParams, "userId">;
};
// TODO: 즐겨찾기 업데이트 굉장히 느린문제 해결
const ExerciseItem = ({
  exercise,
  isSelected,
  onAdd,
  onDelete,
  userId,
  queryOptions = {
    keyword: "",
    category: "전체",
    exerciseType: "전체",
  },
}: ExerciseItem) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { name, id, isBookmarked } = exercise;
  const { openModal } = useModal();
  const { updateBookmark } = useExerciseMutation();
  const handleClick = () =>
    isSelected ? onDelete(exercise.id) : onAdd(exercise.id);

  const handleToggleBookmark = (e: React.MouseEvent<HTMLImageElement>) => {
    e.stopPropagation();
    if (isUpdating) return;
    setIsUpdating(true);

    if (isBookmarked) {
      openModal({
        type: "confirm",
        title: "즐겨찾기에서 제거하시겠습니까?",
        message: name,
        onCancel: () => setIsUpdating(false),
        onConfirm: () => {
          updateBookmark(
            {
              exerciseId: id,
              isBookmarked: true,
              userId,
              ...queryOptions,
            },
            { onSettled: () => setIsUpdating(false) }
          );
        },
      });
    } else {
      updateBookmark(
        {
          exerciseId: id,
          userId,
          isBookmarked: false,
          ...queryOptions,
        },
        { onSettled: () => setIsUpdating(false) }
      );
    }
  };
  return (
    <li
      onClick={handleClick}
      data-name={name}
      data-bookmark={isBookmarked}
      className="px-3 flex justify-between w-full h-[51px] rounded-lg bg-bg-surface"
    >
      <div className="flex items-center gap-5">
        <div className="bg-slate-300 w-8 h-8">
          {/* <Image src={favoriteIcon} alt="운동 이미지" /> */}
        </div>
        <span className={clsx({ "text-primary": isSelected })}>{name}</span>
      </div>
      <div
        role="button"
        data-testid="bookmark-toggle"
        className="self-center"
        onClick={handleToggleBookmark}
      >
        <Image
          src={isBookmarked ? filledFavoriteIcon : favoriteIcon}
          alt={isBookmarked ? "북마크 해제" : "북마크"}
        />
      </div>
    </li>
  );
};

export default ExerciseItem;
