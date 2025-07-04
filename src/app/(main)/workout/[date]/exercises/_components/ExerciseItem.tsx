import { exerciseService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { ClientExercise, ClientUser, LocalExercise } from "@/types/models";
import clsx from "clsx";
import { Star } from "lucide-react";
import { useState } from "react";

export type ExerciseItemProps = {
  exercise: LocalExercise;
  isSelected: boolean;
  onAdd: (newExercise: LocalExercise) => void;
  onDelete: (toBeDeleted: ClientExercise["id"]) => void;
  onReload: () => void;
};
const ExerciseItem = ({
  exercise,
  isSelected,
  onAdd,
  onDelete,
  onReload,
}: ExerciseItemProps) => {
  const { name, id, isBookmarked } = exercise;
  const { openModal, showError } = useModal();
  const handleClick = () => {
    if (!exercise.id) return;
    return isSelected ? onDelete(exercise.id) : onAdd(exercise);
  };
  const handleToggleBookmark = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    try {
      if (!id) return;

      if (isBookmarked) {
        openModal({
          type: "confirm",
          title: "즐겨찾기에서 제거하시겠습니까?",
          message: name,
          onConfirm: async () => {
            await exerciseService.toggleLocalBookmark(id, false);
            onReload();
          },
        });
      } else {
        await exerciseService.toggleLocalBookmark(id, true);
        onReload();
      }
    } catch (e) {
      console.error("[ExerciseItem] Error", e);
      showError("북마크 설정에 실패했습니다.");
    }
  };
  return (
    <li
      role="option"
      aria-selected={isSelected}
      aria-labelledby="name"
      onClick={handleClick}
      className={clsx(
        "px-4 py-3 flex justify-between items-center w-full rounded-xl bg-bg-surface hover:bg-bg-surface-variant transition-all cursor-pointer",
        {
          "ring-2 ring-primary bg-bg-surface-variant": isSelected,
        }
      )}
    >
      <div className="flex items-center gap-3">
        <div className="bg-bg-secondary w-10 h-10 rounded-lg flex items-center justify-center">
          <span className="text-text-muted text-xs">GYM</span>
        </div>
        <span
          aria-selected={isSelected}
          className={clsx("font-medium", { "text-primary": isSelected })}
        >
          {name}
        </span>
      </div>
      <button
        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        onClick={handleToggleBookmark}
        aria-label={isBookmarked ? "북마크 해제" : "북마크"}
      >
        <Star
          className={clsx("w-[22px] h-[22px] transition-colors", {
            "fill-[yellow] text-[yellow]": isBookmarked,
            "text-white fill-none": !isBookmarked,
          })}
          strokeWidth={2}
        />
      </button>
    </li>
  );
};

export default ExerciseItem;
