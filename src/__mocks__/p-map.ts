const pMap = async (
  iterable: unknown[],
  mapper: (item: unknown, index: number) => Promise<unknown>
) => {
  return Promise.all(Array.from(iterable, mapper));
};

export default pMap;
