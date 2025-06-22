import { LocalRoutine } from "@/types/models";
import { getFormattedDateYMD } from "@/util/formatDate";

export const createBaseRoutineMock = (
  overrides?: Partial<LocalRoutine>
): LocalRoutine => ({
  id: Math.floor(Math.random() * 1000),
  userId: "mockUserId",
  isSynced: true,
  serverId: `server-id-${Math.random()}`,

  createdAt: new Date().toISOString(),
  updatedAt: null,
  name: "새루틴",
  description: null,

  ...overrides,
});
