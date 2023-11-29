import { Button, ButtonGroup } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { auth } from "@/api/authentication/firebase";
import getSongAudio from "@/api/getSongAudio";

export default function AudioControls({ projectId }) {
  const [audio, setAudio] = useState();
  const [audioUrl, setAudioUrl] = useState();
  const songId = useSelector((state) => state.songId.songId);

  const audioLogUrl = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;

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
        onClick={async () => {
          const idToken = await auth.currentUser?.getIdToken();
          axios.post(
            audioLogUrl,
            { play: true },
            { headers: { Authorization: `Bearer ${idToken}` } },
          );
          audio?.play();
        }}
      >
        play
      </Button>

      <Button
        type="button"
        onClick={async () => {
          const idToken = await auth.currentUser?.getIdToken();
          axios.post(
            audioLogUrl,
            { pause: true },
            { headers: { Authorization: `Bearer ${idToken}` } },
          );
          audio?.pause();
        }}
      >
        pause
      </Button>
      <Button
        type="button"
        onClick={async () => {
          if (!audio) {
            return;
          }

          const idToken = await auth.currentUser?.getIdToken();
          axios.post(
            audioLogUrl,
            { stop: true },
            { headers: { Authorization: `Bearer ${idToken}` } },
          );
          audio.pause();
          audio.currentTime = 0;
        }}
      >
        stop
      </Button>
    </ButtonGroup>
  );
}
