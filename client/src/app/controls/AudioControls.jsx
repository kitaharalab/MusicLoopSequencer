import { Button, ButtonGroup } from "@chakra-ui/react";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { auth } from "../../components/authentication/firebase";

export default function AudioControls({ projectId }) {
  const [audio, setAudio] = useState();
  const [audioUrl, setAudioUrl] = useState();
  const songId = useSelector((state) => state.songId.songId);

  const audioLogUrl = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}/wav`;

  useEffect(() => {
    audio?.pause();
    if (songId === undefined || songId === null) {
      return () => {};
    }

    const url = `${
      import.meta.env.VITE_SERVER_URL
    }/projects/${projectId}/songs/${songId}/wav/`;
    axios
      .get(url, {
        responseType: "blob",
        headers: { "Content-Type": "audio/wav" },
      })
      .then((response) => {
        if (response.status !== 200) {
          return;
        }

        const { data } = response;
        const songUrl = window.URL.createObjectURL(
          new Blob([data], { type: "audio/wav" }),
        );
        setAudioUrl(songUrl);

        const songAudio = new Audio(songUrl);
        setAudio(songAudio);
      })
      .catch((err) => {
        console.log(err);
      });

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
