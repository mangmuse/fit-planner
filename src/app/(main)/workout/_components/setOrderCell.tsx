import SetOptionSheet from "@/app/(main)/workout/_components/SetOptionSheet";
import { RPE_OPTIONS, SET_TYPES } from "@/app/(main)/workout/constants";
import { useBottomSheet } from "@/providers/contexts/BottomSheetContext";
import { LocalWorkoutDetail } from "@/types/models";
import clsx from "clsx";

type SetOrderCellProps = {
  workoutDetail: LocalWorkoutDetail;
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
          height: 150,
          children: <SetOptionSheet workoutDetail={workoutDetail} />,
        });
      }}
      data-testid={"setOrder"}
      className={clsx(
        "cursor-pointer text-center underline underline-offset-2",
        setTypeOption && setTypeOption.textColor
      )}
    >
      {setTypeOption ? setTypeOption.shortLabel : workoutDetail.setOrder}
      {RPEOption && (
        <span
          className={`w-3 h-3 rounded-full relative inline-block -top-2 text-[8px] ${RPEOption.activeTextColor}`}
          id="rpe"
        >
          {RPEOption.value}
        </span>
      )}
    </td>
  );
};

export default SetOrderCell;
