import { vars } from "@/styles/globalThemes.css";
import { style } from "@vanilla-extract/css";

export const centerContainer = style({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  minHeight: "100vh",
  alignItems: "center",
});

export const mobileContainer = style({
  display: "flex",
  flexDirection: "column",

  width: "100%",
  minHeight: "100vh",
  maxWidth: 390,

  boxSizing: "border-box",

  backgroundColor: vars.colors.bg.base,
  color: vars.colors.text.white,
});

export const mainContent = style({
  flexGrow: 1,
  padding: "0 16px",
});
