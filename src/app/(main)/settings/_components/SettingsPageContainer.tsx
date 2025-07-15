"use client";

import { signOut, useSession } from "next-auth/react";
import { syncAllService } from "@/lib/di";
import { SettingsGroup } from "./SettingsGroup";
import { SettingsItem } from "./SettingsItem";
import { WeightUnitSetting } from "./WeightUnitSetting";
import { useState } from "react";
import { useModal } from "@/providers/contexts/ModalContext";
import ProgressSpinner from "@/components/ProgressSpinner";

const SettingsPageContainer = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { showError, openModal, closeModal } = useModal();

  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("[SettingsPageContainer] handleSignOut:", error);
      showError("로그아웃 중 오류가 발생했습니다.");
      setIsSigningOut(false);
    }
  };

  const handleUploadToServer = async () => {
    closeModal();

    setTimeout(() => {
      openModal({
        type: "generic",
        children: <ProgressSpinner message="서버로 업로드 중..." />,
        disableBackdropClick: true,
      });
    }, 0);

    try {
      await syncAllService.overWriteToServer(userId!);
      closeModal();
    } catch (error) {
      console.error("서버 동기화 오류:", error);
      showError("동기화 중 오류가 발생했습니다.");
    }
  };

  const handleSyncToServer = async () => {
    if (!userId) {
      showError("로그인이 필요합니다.");
      return;
    }

    openModal({
      type: "confirm",
      title: "서버로 업로드",
      message:
        "현재 로컬 데이터가 서버 데이터를 덮어씌웁니다.\n이 작업은 되돌릴 수 없습니다.\n\n계속하시겠습니까?",
      onConfirm: handleUploadToServer,
    });
  };

  const handleDownloadFromServer = async () => {
    closeModal();

    setTimeout(() => {
      openModal({
        type: "generic",
        children: <ProgressSpinner message="서버에서 다운로드 중..." />,
        disableBackdropClick: true,
      });
    }, 0);

    try {
      await syncAllService.overWriteAllWithServerData(userId!);
      closeModal();
    } catch (error) {
      console.error("클라이언트 동기화 오류:", error);
      showError("동기화 중 오류가 발생했습니다.");
    }
  };

  const handleSyncFromServer = async () => {
    if (!userId) {
      showError("로그인이 필요합니다.");
      return;
    }

    openModal({
      type: "confirm",
      title: "서버에서 다운로드",
      message:
        "서버 데이터가 현재 로컬 데이터를 덮어씌웁니다.\n이 작업은 되돌릴 수 없습니다.\n\n계속하시겠습니까?",
      onConfirm: handleDownloadFromServer,
    });
  };

  return (
    <div className="space-y-6">
      <SettingsGroup title="일반">
        <WeightUnitSetting />
      </SettingsGroup>

      <SettingsGroup title="계정">
        <SettingsItem
          title={session?.user?.email || "사용자"}
          description="로그인됨"
        />
        <SettingsItem
          title={isSigningOut ? "로그아웃 중..." : "로그아웃"}
          onClick={handleSignOut}
          className="text-warning"
          disabled={isSigningOut}
        />
      </SettingsGroup>

      <SettingsGroup title="데이터 동기화">
        <SettingsItem
          title="서버로 업로드"
          description="로컬 데이터를 서버에 저장"
          onClick={handleSyncToServer}
        />
        <SettingsItem
          title="서버에서 다운로드"
          description="서버 데이터로 로컬 덮어쓰기"
          onClick={handleSyncFromServer}
        />
      </SettingsGroup>
    </div>
  );
};

export default SettingsPageContainer;
