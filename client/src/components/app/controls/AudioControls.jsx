import { Button, ButtonGroup } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { sendSongPauseLog, sendSongPlayLog, sendSongStopLog } from "@/api/log";
import { getSongAudio } from "@/api/song";
import { getApiParams } from "@/redux/apiParamSlice";

export default function AudioControls() {
  const [audio, setAudio] = useState();
  const [audioUrl, setAudioUrl] = useState();
  const { projectId, songId } = useSelector(getApiParams);

  useEffect(() => {
    async function updateSongAudio() {
      if (songId === undefined || songId === null) {
        return;
      }

      const { url, audio: newAudio } = await getSongAudio(projectId, songId);
      if (!url || !newAudio) {
        return;
      }

      audio?.pause();
      window.URL.revokeObjectURL(audioUrl);
      setAudioUrl(url);
      setAudio(newAudio);
    }

    audio?.pause();
    updateSongAudio();

    return () => {
      window.URL.revokeObjectURL(audioUrl);
      setAudio(undefined);
    };
  }, [songId]);

  return (
    <ButtonGroup>
      <Button
        type="button"
        onClick={() => {
          audio?.play();
          sendSongPlayLog(projectId, songId);
        }}
      >
        play
      </Button>

      <Button
        type="button"
        onClick={() => {
          audio?.pause();
          sendSongPauseLog(projectId, songId);
        }}
      >
        pause
      </Button>
      <Button
        type="button"
        onClick={() => {
          if (!audio) {
            return;
          }

          audio.pause();
          audio.currentTime = 0;
          sendSongStopLog(projectId, songId);
        }}
      >
        stop
      </Button>
    </ButtonGroup>
  );
}
