import { ButtonGroup, IconButton, useBoolean } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { BiPlayCircle, BiPauseCircle, BiStopCircle } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useBlocker } from "react-router";

import { sendSongPauseLog, sendSongPlayLog, sendSongStopLog } from "@/api/log";
import { getSongAudio } from "@/api/song";
import { getApiParams } from "@/redux/apiParamSlice";

export default function AudioControls() {
  const [audio, setAudio] = useState();
  const [audioUrl, setAudioUrl] = useState();
  const { projectId, songId } = useSelector(getApiParams);
  const [isPlaying, setIsPlaying] = useBoolean();

  useBlocker(() => {
    audio?.pause();
    return false;
  });

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
      <IconButton
        icon={isPlaying ? <BiPauseCircle /> : <BiPlayCircle />}
        disabled={audio == null || audioUrl == null}
        fontSize="30"
        onClick={() => {
          if (isPlaying) {
            audio?.pause();
            sendSongPauseLog(projectId, songId);
          } else {
            audio?.play();
            sendSongPlayLog(projectId, songId);
          }
          setIsPlaying.toggle();
        }}
      />
      <IconButton
        icon={<BiStopCircle />}
        disabled={audio == null || audioUrl == null}
        fontSize="30"
        onClick={() => {
          if (!audio) {
            return;
          }

          audio.pause();
          audio.currentTime = 0;
          sendSongStopLog(projectId, songId);
          setIsPlaying.off();
        }}
      />
    </ButtonGroup>
  );
}
