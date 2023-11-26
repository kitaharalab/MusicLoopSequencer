import { extendTheme, theme } from "@chakra-ui/react";

const extendedTheme = extendTheme({
  colors: {
    part: {
      drums: theme.colors.red[200],
      bass: theme.colors.yellow[200],
      synth: theme.colors.green[200],
      sequence: theme.colors.blue[200],
    },
  },
});

export default extendedTheme;
