import React from "react";
import { FormControl, Button, Box, Flex, Spacer } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import createMusic from "../../createMusic";
import { setParts } from "../../redux/soundsSlice";
import { setId } from "../../redux/songIdSlice";
import AudioControls from "./AudioControls";
import Evaluation from "./Evaluation";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const linesY = useSelector((state) => state.lines1.lines);

  return (
    <FormControl>
      <Flex>
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
        <Spacer />
        <AudioControls />
        <Spacer />
        <Evaluation />
      </Flex>
    </FormControl>
  );
}
