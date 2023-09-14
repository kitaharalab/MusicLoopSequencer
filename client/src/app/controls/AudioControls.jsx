import React, { useState } from "react";
import { Button, ButtonGroup } from "@chakra-ui/react";

export default function AudioControls() {
  const [audio, _setAudio] = useState(null);

  return (
    <ButtonGroup>
      <Button type="button" onClick={() => audio.play()} isDisabled>
        play
      </Button>
      <Button type="button" onClick={() => audio.pause()} isDisabled>
        pause
      </Button>
      <Button
        type="button"
        onClick={() => {
          audio.pause();
          audio.currentTime = 0;
        }}
        isDisabled
      >
        stop
      </Button>
    </ButtonGroup>
  );
}
