import { extendTheme, theme } from "@chakra-ui/react";

const extendedTheme = extendTheme({
  colors: {
    part: {
      light: {
        drums: theme.colors.red[200],
        bass: theme.colors.yellow[200],
        synth: theme.colors.purple[200],
        sequence: theme.colors.cyan[200],
      },
      dark: {
        drums: theme.colors.red[500],
        bass: theme.colors.yellow[500],
        synth: theme.colors.purple[500],
        sequence: theme.colors.cyan[500],
      },
      sequence: {
        drums: ["#320E0E", "#802323", "#E53E3E", "#FF9999", "#FFD9D9"],
        bass: ["#33260B", "#805E1B", "#D69E2E", "#FFDD99", "#FFF2D9"],
        synth: ["#100D1A", "#654D99", "#AF91F2", "#D8CEF2", "#F6F2FF"],
        sequence: ["#002B33", "#3A7580", "#70BDCC", "#A1DBE6", "#D9F9FF"],
      },
    },
  },
});

export default extendedTheme;
