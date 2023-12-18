import { extendTheme, theme } from "@chakra-ui/react";

const extendedTheme = extendTheme({
  colors: {
    part: {
      light: {
        drums: theme.colors.red[200],
        bass: theme.colors.yellow[200],
        synth: theme.colors.green[200],
        sequence: theme.colors.blue[200],
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
