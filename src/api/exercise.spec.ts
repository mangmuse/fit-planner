import { getAllExercises } from "@/api/exercise";

it("제대로 나오나", async () => {
  const res = await getAllExercises("", "전체", "전체");
  console.log(res);
});
