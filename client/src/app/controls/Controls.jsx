import React from "react";
import { FormControl, Button, Box, Flex, Spacer } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import createMusic from "../../createMusic";
import { setParts } from "../../redux/soundsSlice";
import { setSongId } from "../../redux/songIdSlice";
import AudioControls from "./AudioControls";
import Evaluation from "./Evaluation";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const { lines, max } = useSelector((state) => state.lines1);
  return (
    <FormControl>
      <Flex>
        <Box>
          <Button
            type="button"
            onClick={async () => {
              const music = await createMusic(projectId, lines, max);
              console.log("get music", music);
              dispatch(setParts(music.parts));
              dispatch(setSongId(music.songid));
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
