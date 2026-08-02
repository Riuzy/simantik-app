import { createTheme } from "@mantine/core";
import { colors } from "./colors";
import { fontFamily, headings } from "./typography";
import { components } from "./components";

export const theme = createTheme({
  primaryColor: colors.primary,
  defaultRadius: "md",
  fontFamily,
  headings,
  components,
});
