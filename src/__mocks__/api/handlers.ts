import { BASE_URL } from "@/constants";
import { ClientExerise } from "@/types/models";
import { http } from "msw";

const exercises: ClientExerise[] = [
  {
    id: 1,
    name: "벤치프레스",
    category: "가슴",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-01T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 2,
    name: "스쿼트",
    category: "하체",
    isCustom: false,
    isBookmarked: false,
    createdAt: "2023-01-02T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 3,
    name: "데드리프트",
    category: "하체",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
  {
    id: 4,
    name: "랫풀다운",
    category: "등",
    isCustom: false,
    isBookmarked: true,
    createdAt: "2023-01-03T00:00:00Z",
    userId: null,
    imageUrl: "/",
  },
];

export const handlers = [
  http.get(`${BASE_URL}/api/exercises/all`, ({ request }) => {
    console.log("helooooo");
    const url = new URL(request.url);
    const keyword = decodeURIComponent(url.searchParams.get("keyword") || "");
    const category = decodeURIComponent(
      url.searchParams.get("category") || "전체"
    );
    const type = decodeURIComponent(url.searchParams.get("type") || "전체");

    const filtered = exercises.filter((exercise) => {
      const matchesKeyword = exercise.name
        .toLowerCase()
        .includes(keyword.toLowerCase());
      const matchesCategory =
        category === "전체" || exercise.category === category;
      const matchesType =
        type === "전체"
          ? true
          : type === "커스텀"
          ? exercise.isCustom
          : type === "즐겨찾기"
          ? exercise.isBookmarked
          : true;

      return matchesKeyword && matchesCategory && matchesType;
    });

    return new Response(JSON.stringify(filtered), {
      status: 200,
    });
  }),
];
