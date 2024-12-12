import { vars } from "@/styles/globalThemes.css";
import { style } from "@vanilla-extract/css";

export const centerContainer = style({
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  justifyContent: "center",
});

export const mobileContainer = style({
  width: "100%",
  maxWidth: 375,
  backgroundColor: vars.colors.bg.base,
  padding: "0 16px",
  boxSizing: "border-box",
  maxHeight: "100vh",
  color: vars.colors.text.white,
});
