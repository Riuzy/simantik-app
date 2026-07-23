export const colors = {
  primary: "blue",
  success: "green",
  warning: "yellow",
  danger: "red",
  info: "cyan",
  gray: "gray",
} as const;

export type ColorKey = keyof typeof colors;
