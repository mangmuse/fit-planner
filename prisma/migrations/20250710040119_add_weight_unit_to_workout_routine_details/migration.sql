-- AlterTable
ALTER TABLE "RoutineDetail" ADD COLUMN     "weightUnit" "Unit" NOT NULL DEFAULT 'kg';

-- AlterTable
ALTER TABLE "WorkoutDetail" ADD COLUMN     "weightUnit" "Unit" NOT NULL DEFAULT 'kg';
