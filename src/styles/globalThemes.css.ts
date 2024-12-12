import { createGlobalTheme, globalStyle } from "@vanilla-extract/css";

export const vars = createGlobalTheme(":root", {
  colors: {
    bg: {
      base: "#111111",
      secondary: "#222222",
      surface: "#292929",
    },
    text: {
      muted: "#808080",
      black: "#111111",
      white: "#ffffff",
    },
    primary: "#B0EB5F",

    warning: "#E05745",

    white: "#ffffff",
  },
});

globalStyle("ol, ul, li", {
  listStyle: "none",
});

globalStyle("a", {
  textDecoration: "none",
});
