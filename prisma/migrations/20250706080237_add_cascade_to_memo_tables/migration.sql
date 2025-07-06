-- DropForeignKey
ALTER TABLE "DailyExerciseMemo" DROP CONSTRAINT "DailyExerciseMemo_userExerciseId_fkey";

-- DropForeignKey
ALTER TABLE "FixedExerciseMemo" DROP CONSTRAINT "FixedExerciseMemo_userExerciseId_fkey";

-- AddForeignKey
ALTER TABLE "FixedExerciseMemo" ADD CONSTRAINT "FixedExerciseMemo_userExerciseId_fkey" FOREIGN KEY ("userExerciseId") REFERENCES "UserExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyExerciseMemo" ADD CONSTRAINT "DailyExerciseMemo_userExerciseId_fkey" FOREIGN KEY ("userExerciseId") REFERENCES "UserExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
