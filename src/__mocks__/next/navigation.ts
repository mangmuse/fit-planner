export const useRouter = jest.fn(() => ({
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
}));

export const useParams = jest.fn().mockReturnValue({
  date: "2025-01-01",
});

export const usePathname = jest.fn().mockReturnValue("/workout/2025-01-01");
