jest.mock("next-auth/react");
jest.mock("@/lib/di");

jest.mock("@/providers/contexts/ModalContext");

import { signOut, useSession } from "@/__mocks__/next-auth/react";
import SettingsPageContainer from "@/app/(main)/settings/_components/SettingsPageContainer";
import ProgressSpinner from "@/components/ProgressSpinner";
import { syncAllService } from "@/lib/di";
import { useModal } from "@/providers/contexts/ModalContext";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const mockedUseModal = jest.mocked(useModal);
const mockedSyncAllService = jest.mocked(syncAllService);

describe("SettingsPageContainer", () => {
  const mockUser = "user123";
  const mockOpenModal = jest.fn();
  const mockCloseModal = jest.fn();
  const mockShowError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockedUseModal.mockReturnValue({
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      showError: mockShowError,
      isOpen: false,
    });
  });

  describe("렌더링", () => {
    it("계정 그룹의 아이템이 올바르게 렌더링 되어야 한다", () => {
      render(<SettingsPageContainer />);

      const accountGroup = screen.getByRole("heading", {
        level: 2,
        name: "계정",
      });
      const accountSection = accountGroup.closest("section");

      expect(accountSection).toBeInTheDocument();
      expect(accountSection).toContainElement(
        screen.getByText("test@example.com")
      );
      expect(accountSection).toContainElement(screen.getByText("로그인됨"));

      expect(accountSection).toContainElement(screen.getByText("로그아웃"));
    });

    it("데이터 동기화 그룹의 아이템이 올바르게 렌더링 되어야 한다", () => {
      render(<SettingsPageContainer />);

      const dataSyncGroup = screen.getByRole("heading", {
        level: 2,
        name: "데이터 동기화",
      });

      const dataSyncSection = dataSyncGroup.closest("section");

      expect(dataSyncSection).toBeInTheDocument();
      expect(dataSyncSection).toContainElement(
        screen.getByText("서버로 업로드")
      );
      expect(dataSyncSection).toContainElement(
        screen.getByText("로컬 데이터를 서버에 저장")
      );

      expect(dataSyncSection).toContainElement(
        screen.getByText("서버에서 다운로드")
      );
      expect(dataSyncSection).toContainElement(
        screen.getByText("서버 데이터로 로컬 덮어쓰기")
      );
    });
  });

  describe("상호작용", () => {
    const user = userEvent.setup();
    it("로그아웃 버튼을 클릭하면 로그아웃 되어야 한다", async () => {
      render(<SettingsPageContainer />);

      const logoutButton = screen.getByText("로그아웃");
      await user.click(logoutButton);

      expect(signOut).toHaveBeenCalledTimes(1);
    });

    it("로그아웃 도중 에러 발생시 에러 모달이 표시된다", async () => {
      (signOut as jest.Mock).mockRejectedValueOnce(new Error("로그아웃 실패"));

      render(<SettingsPageContainer />);

      const logoutButton = screen.getByText("로그아웃");
      await user.click(logoutButton);

      expect(mockShowError).toHaveBeenCalledTimes(1);
      expect(mockShowError).toHaveBeenCalledWith(
        "로그아웃 중 오류가 발생했습니다."
      );
    });

    describe("동기화", () => {
      it("서버로 업로드 버튼을 클릭하면 확인모달이 표시되며 확인을 누르면 로컬데이터를 서버에 저장해야한다", async () => {
        render(<SettingsPageContainer />);

        const uploadButton = screen.getByText("서버로 업로드");
        await user.click(uploadButton);

        expect(mockOpenModal).toHaveBeenCalledWith({
          type: "confirm",
          title: "서버로 업로드",
          message: expect.any(String),
          onConfirm: expect.any(Function),
        });

        const confirmCall = mockOpenModal.mock.calls[0][0];
        const onConfirm = confirmCall.onConfirm;

        await onConfirm();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockOpenModal).toHaveBeenCalledWith({
          type: "generic",
          children: expect.objectContaining({
            type: ProgressSpinner,
          }),
          disableBackdropClick: true,
        });

        expect(syncAllService.overWriteToServer).toHaveBeenCalledTimes(1);
        expect(syncAllService.overWriteToServer).toHaveBeenCalledWith(mockUser);

        expect(mockCloseModal).toHaveBeenCalledTimes(2);
      });

      it("서버에서 다운로드 버튼을 클릭하면 확인모달이 표시되며 확인을 누르면 서버데이터로 로컬을 덮어써야한다", async () => {
        render(<SettingsPageContainer />);

        const downloadButton = screen.getByText("서버에서 다운로드");
        await user.click(downloadButton);

        expect(mockOpenModal).toHaveBeenCalledWith({
          type: "confirm",
          title: "서버에서 다운로드",
          message: expect.any(String),
          onConfirm: expect.any(Function),
        });

        const confirmCall = mockOpenModal.mock.calls[0][0];
        const onConfirm = confirmCall.onConfirm;

        await onConfirm();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockOpenModal).toHaveBeenCalledWith({
          type: "generic",
          children: expect.objectContaining({
            type: ProgressSpinner,
          }),
          disableBackdropClick: true,
        });

        expect(syncAllService.overWriteAllWithServerData).toHaveBeenCalledTimes(
          1
        );
        expect(syncAllService.overWriteAllWithServerData).toHaveBeenCalledWith(
          mockUser
        );

        expect(mockCloseModal).toHaveBeenCalledTimes(2);
      });

      it("서버로 업로드 도중 에러 발생시 에러모달이 표시되어야 한다", async () => {
        mockedSyncAllService.overWriteToServer.mockRejectedValueOnce(
          new Error("서버 연결 실패")
        );

        render(<SettingsPageContainer />);

        const uploadButton = screen.getByText("서버로 업로드");
        await user.click(uploadButton);

        const confirmCall = mockOpenModal.mock.calls[0][0];
        const onConfirm = confirmCall.onConfirm;

        await onConfirm();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockShowError).toHaveBeenCalledTimes(1);
        expect(mockShowError).toHaveBeenCalledWith(
          "동기화 중 오류가 발생했습니다."
        );

        expect(mockCloseModal).toHaveBeenCalledTimes(1);
      });

      it("서버에서 다운로드 도중 에러 발생시 에러모달이 표시되어야 한다", async () => {
        mockedSyncAllService.overWriteAllWithServerData.mockRejectedValueOnce(
          new Error("서버 연결 실패")
        );

        render(<SettingsPageContainer />);

        const downloadButton = screen.getByText("서버에서 다운로드");
        await user.click(downloadButton);

        const confirmCall = mockOpenModal.mock.calls[0][0];
        const onConfirm = confirmCall.onConfirm;

        await onConfirm();

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockShowError).toHaveBeenCalledTimes(1);
        expect(mockShowError).toHaveBeenCalledWith(
          "동기화 중 오류가 발생했습니다."
        );

        expect(mockCloseModal).toHaveBeenCalledTimes(1);
      });
    });
  });
});
