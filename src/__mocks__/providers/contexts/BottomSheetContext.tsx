export const useBottomSheet = jest.fn().mockReturnValue({
  openBottomSheet: jest.fn(),
});
export const BottomSheetProvider = ({ children }) => <div>{children}</div>;
