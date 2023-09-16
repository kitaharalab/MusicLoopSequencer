import { Button, ButtonGroup } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

export default function AudioControls({ projectId }) {
  const [audio, setAudio] = useState();
  const [audioUrl, setAudioUrl] = useState();
  const songId = useSelector((state) => state.songId.songId);

  useEffect(() => {
    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}/wav`;
    axios.get(url, { responseType: "blob" }).then((response) => {
      const { data } = response;
      const songUrl = window.URL.createObjectURL(
        new Blob([data], { type: "audio/wav" }),
      );
      setAudioUrl(songUrl);

      const songAudio = new Audio(songUrl);
      setAudio(songAudio);
    });

    return () => {
      window.URL.revokeObjectURL(audioUrl);
      setAudio(undefined);
    };
  }, [songId]);

  return (
    <ButtonGroup>
      <Button type="button" onClick={() => audio?.play()}>
        play
      </Button>

      <Button type="button" onClick={() => audio?.pause()}>
        pause
      </Button>
      <Button
        type="button"
        onClick={() => {
          audio?.pause();
          audio.currentTime = 0;
        }}
      >
        stop
      </Button>
    </ButtonGroup>
  );
}
