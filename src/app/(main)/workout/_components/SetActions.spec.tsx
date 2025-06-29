// import { mockLocalWorkoutDetails } from "@/__mocks__/workoutDetail.mock";
// import SetActions from "@/app/(main)/workout/_components/SetActions";
// import {
//   addSetToWorkout,
//   deleteWorkoutDetail,
// } from "@/services/workoutDetail.service";
// import { customRender, screen } from "@/test-utils/test-utils";
// import userEvent from "@testing-library/user-event";
// jest.mock("@/services/workoutDetail.service");

// describe("SetActions", () => {
//   const renderSetActions = () => {
//     const mockDetail = { ...mockLocalWorkoutDetails[0], workoutId: 1 };
//     const loadDetailsMock = jest.fn();
//     const utils = customRender(
//       <SetActions
//         lastValue={mockDetail}
//         loadLocalWorkoutDetails={loadDetailsMock}
//       />
//     );
//     return {
//       ...utils,
//       mockDetail,
//       loadDetailsMock,
//     };
//   };

//   it("세트 추가 버튼 클릭 시 addSet와 loadLocalWorkoutDetails가 호출된다", async () => {
//     const { loadDetailsMock, mockDetail } = renderSetActions();

//     const addSetBtn = screen.getByText("Add Set");
//     expect(addSetBtn).toBeInTheDocument();
//     await userEvent.click(addSetBtn);

//     expect(addSetToWorkout).toHaveBeenCalledWith(mockDetail);

//     expect(loadDetailsMock).toHaveBeenCalledTimes(1);
//   });

//   it("세트 삭제 버튼 클릭 시 deleteSet 과 loadLocalWorkoutDetails가 호출된다", async () => {
//     const { loadDetailsMock, mockDetail } = renderSetActions();

//     const deleteSetBtn = screen.getByText("Delete Set");
//     expect(deleteSetBtn).toBeInTheDocument();
//     await userEvent.click(deleteSetBtn);

//     expect(deleteWorkoutDetail).toHaveBeenCalledWith(mockDetail.id);

//     expect(loadDetailsMock).toHaveBeenCalledTimes(1);
//   });
// });
