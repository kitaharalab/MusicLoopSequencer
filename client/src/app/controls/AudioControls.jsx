import React, { useState } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";

export default function AudioControls() {
  const [audio, _setAudio] = useState(null);

  return (
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
    </ButtonGroup>
  );
}
