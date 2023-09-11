import React, { useState } from "react";
import { FormControl, Button, ButtonGroup } from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import createMusic from "../createMusic";
import { setParts } from "../redux/soundsSlice";
import { setId } from "../redux/songIdSlice";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const [audio, _setAudio] = useState(null);
  const linesY = useSelector((state) => state.lines1.lines);

  return (
    <FormControl>
      <ButtonGroup>
        <Button type="button" onClick={() => audio.play()}>
          play
        </Button>
        <Button type="button" onClick={() => audio.pause()}>
          pause
        </Button>
        <Button
          type="button"
          onClick={() => {
            audio.pause();
            audio.currentTime = 0;
          }}
        >
          stop
        </Button>
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
      </ButtonGroup>
    </FormControl>
  );
}
