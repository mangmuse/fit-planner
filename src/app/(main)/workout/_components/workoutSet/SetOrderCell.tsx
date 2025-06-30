import SetOptionSheet from "@/app/(main)/workout/_components/setOptions/SetOptionSheet";
import { RPE_OPTIONS, SET_TYPES } from "@/app/(main)/workout/constants";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { LocalRoutineDetail, LocalWorkoutDetail } from "@/types/models";
import clsx from "clsx";

export type SetOrderCellProps = {
  workoutDetail: LocalWorkoutDetail | LocalRoutineDetail;
  loadLocalWorkoutDetails: () => Promise<void>;
};

const SetOrderCell = ({
  loadLocalWorkoutDetails,
  workoutDetail,
}: SetOrderCellProps) => {
  const { openBottomSheet } = useBottomSheet();
  const { setType, rpe } = workoutDetail;
  const setTypeOption =
    setType !== "NORMAL" && SET_TYPES.find((type) => type.value === setType);

  const RPEOption = RPE_OPTIONS.find((option) => option.value === rpe) ?? null;

  return (
    <td
      onClick={() => {
        openBottomSheet({
          onClose: loadLocalWorkoutDetails,
          minHeight: 150,
          children: <SetOptionSheet workoutDetail={workoutDetail} />,
        });
      }}
      data-testid={setTypeOption ? "set-type" : "set-order"}
      className={clsx(
        "relative cursor-pointer text-center underline underline-offset-2",
        setTypeOption && setTypeOption.textColor
      )}
    >
      {setTypeOption ? setTypeOption.shortLabel : workoutDetail.setOrder}
      {RPEOption && (
        <span
          data-testid="rpe"
          className={clsx(
            "absolute top-[-1px] right-1 text-[8px] inline-flex items-center justify-center w-3 h-3 rounded-full",
            RPEOption.activeTextColor
          )}
        >
          {RPEOption.value}
        </span>
      )}
    </td>
  );
};

export default SetOrderCell;
