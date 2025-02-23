jest.mock("@/services/workoutDetail.service");

import WorkoutCheckbox, {
  WorkoutCheckboxProps,
} from "@/app/(main)/workout/_components/WorkoutCheckbox";
import { updateLocalWorkoutDetail } from "@/services/workoutDetail.service";
import { customRender, screen } from "@/test-utils/test-utils";
import userEvent from "@testing-library/user-event";

describe("WorkoutCheckbox", () => {
  // TODO: 체크박스 스타일링 후에 관련테스트 추가
  const loadDetailsMock = jest.fn();
  const renderWorkoutCheckbox = (props?: WorkoutCheckboxProps) => {
    customRender(
      <WorkoutCheckbox
        id={1}
        prevIsDone={true}
        loadLocalWorkoutDetails={loadDetailsMock}
        {...props}
      />
    );
    return {
      loadDetailsMock,
    };
  };

  it("prevIsDone이 있을경우 isDone의 초기값이 prevIsDone과 같아진다", () => {
    renderWorkoutCheckbox();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });
  it("prevIsDone이 없을경우 isDone의 초기값이 false이다", () => {
    customRender(<WorkoutCheckbox loadLocalWorkoutDetails={loadDetailsMock} />);
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("체크박스 상태를 변경하면 updateLocalWorkoutDetail 과 loadLocalWorkoutDetails 가 호출된다 ", async () => {
    const { loadDetailsMock } = renderWorkoutCheckbox();
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);

    expect(updateLocalWorkoutDetail).toHaveBeenCalledWith({
      isDone: false,
      id: 1,
    });
    expect(loadDetailsMock).toHaveBeenCalledTimes(1);
  });
  it("체크박스 상태를 변경할때 id가 없을경우 updateLocalWorkoutDetail를 호출하지 않는다 ", async () => {
    const { loadDetailsMock } = renderWorkoutCheckbox({
      prevIsDone: true,
      id: undefined,
    });

    const checkbox = screen.getByRole("checkbox");
    screen.debug();
    expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    expect(updateLocalWorkoutDetail).toHaveBeenCalledTimes(0);
    expect(loadDetailsMock).toHaveBeenCalledTimes(0);
  });
});
