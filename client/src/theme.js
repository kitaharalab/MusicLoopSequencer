import { extendTheme, theme } from "@chakra-ui/react";

const extendedTheme = extendTheme({
  colors: {
    part: {
      light: {
        drums: theme.colors.red[100],
        bass: theme.colors.yellow[100],
        synth: theme.colors.green[100],
        sequence: theme.colors.blue[100],
      },
      dark: {
        drums: theme.colors.red[500],
        bass: theme.colors.yellow[500],
        synth: theme.colors.green[500],
        sequence: theme.colors.blue[500],
      },
    },
  },
});

export default extendedTheme;
