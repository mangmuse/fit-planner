import { vars } from "@/styles/globalThemes.css";
import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const bottomNavBarContainer = style({
  position: "sticky",
  bottom: 0,
  width: "100%",
  height: "52px",
  color: vars.colors.text.muted,
  display: "flex",
  justifyContent: "space-around",
  alignItems: "center",
});

export const navBarButton = recipe({
  base: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    fontSize: "12px",
    cursor: "pointer",
    color: vars.colors.text.muted,
  },
  variants: {
    isActive: {
      true: {
        color: vars.colors.primary,
      },
    },
  },
});

export const navBarButtonIcon = style({
  marginBottom: 4,
});
