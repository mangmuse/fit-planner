import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { useModal } from "@/providers/contexts/ModalContext";
import { LocalRoutine } from "@/types/models";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import rightChevron from "public/right-chevron.svg";
import dayjs from "dayjs";

type RoutineItemProps = {
  routine: LocalRoutine;
  onPick?: (routineId: number) => Promise<void>;
};

const RoutineItem = ({ routine, onPick }: RoutineItemProps) => {
  const router = useRouter();
  const { openModal, closeModal } = useModal();
  const { closeBottomSheet } = useBottomSheet();
  const confirmPickRoutine = async () => {
    if (onPick) {
      closeBottomSheet();
      openModal({
        title: "루틴 선택",
        type: "confirm",
        message: `${routine.name} 루틴을 선택하시겠습니까?`,
        onConfirm: async () => {
          await onPick(Number(routine.id));
        },
        onCancel: () => {
          closeModal();
        },
      });
    }
  };

  const handleClick = async () => {
    if (onPick) {
      await confirmPickRoutine();
    } else {
      router.push(`/routines/${routine.id}`);
    }
  };
  return (
    <li>
      <button
        onClick={handleClick}
        className="w-full p-4 bg-bg-surface rounded-xl hover:bg-bg-surface-variant transition-colors shadow-sm"
      >
        <div className="flex items-center justify-between">
          <div className="text-left">
            <h3 className="font-medium text-base mb-1">{routine.name}</h3>
            <p className="text-text-muted text-sm">
              {routine.updatedAt
                ? `마지막 수정: ${dayjs(routine.updatedAt).format(
                    "YYYY. M. D."
                  )}`
                : "새로운 루틴"}
            </p>
          </div>
          <Image src={rightChevron} alt="상세보기" width={20} height={20} />
        </div>
      </button>
    </li>
  );
};

export default RoutineItem;
