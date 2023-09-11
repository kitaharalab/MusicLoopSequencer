import React, { useState } from "react";
import { FormControl, Button, Box } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import createMusic from "../../createMusic";
import { setParts } from "../../redux/soundsSlice";
import { setId } from "../../redux/songIdSlice";
import AudioControls from "./AudioControls";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const linesY = useSelector((state) => state.lines1.lines);

  return (
    <FormControl display="flex">
      <Box>
        <Button
          type="button"
          onClick={async () => {
            const music = await createMusic(projectId, linesY);
            dispatch(setParts(music.parts));
            dispatch(setId(music.songid));
          }}
        >
          create
        </Button>
      </Box>
      <Box>
        <AudioControls />
      </Box>
    </FormControl>
  );
}
