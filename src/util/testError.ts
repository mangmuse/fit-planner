export const testError = () => {
  let errorCount = 0;
  return () => {
    if (errorCount === 0) {
      errorCount++;
      throw new Error("테스트 에러");
    }
  };
};
