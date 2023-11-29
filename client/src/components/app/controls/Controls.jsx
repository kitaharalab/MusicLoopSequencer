import {
  FormControl,
  Button,
  Box,
  Flex,
  Spacer,
  Select,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { useDispatch, useSelector } from "react-redux";

import AudioControls from "./AudioControls";
import Evaluation from "./Evaluation";

import { auth } from "@/api/authentication/firebase";
import { createMusic } from "@/api/song";
import { getSongs } from "@/api/project";
import { setSongId } from "@/redux/songIdSlice";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const { lines, max } = useSelector((state) => state.lines1);
  const songId = useSelector((state) => state.songId.songId);
  const [songHistory, setSongHistory] = useState([]);
  const songCreatedToast = useToast();
  const [creating, setCreating] = useState(false);

  const handleSelectedSongChange = (e) => {
    const selectSongId = parseInt(e.target.value, 10);
    dispatch(setSongId(selectSongId));
  };

  useEffect(() => {
    async function getSongsFromProject() {
      const songs = await getSongs(projectId);
      setSongHistory(songs);
    }

    getSongsFromProject();
  }, []);

  useEffect(() => {
    const historySet = new Set([
      ...songHistory.map((h) => JSON.stringify(h)),
      JSON.stringify({ name: songId, id: songId }),
    ]);
    setSongHistory([...historySet].map((h) => JSON.parse(h)));
  }, [songId]);

  async function handleCreateMusic() {
    flushSync(() => setCreating(true));
    const creatingMusic = createMusic(
      projectId,
      lines,
      max,
      auth.currentUser?.uid,
    );
    songCreatedToast.promise(creatingMusic, {
      success: {
        title: "created song",
        status: "success",
        position: "bottom-left",
        isClosable: true,
      },
      error: {
        title: "failed to create song",
        status: "error",
        position: "bottom-left",
      },
      loading: {
        title: "creating song",
        status: "info",
        position: "bottom-left",
      },
    });
    const music = await creatingMusic.finally(() => setCreating(false));

    const { songId: newSongId } = music;
    dispatch(setSongId(newSongId));
    setSongHistory([...songHistory, { name: newSongId, id: newSongId }]);
  }

  return (
    <FormControl>
      <Flex>
        <Box>
          <Flex>
            <Button
              type="button"
              isDisabled={creating}
              onClick={async () => handleCreateMusic()}
            >
              create
            </Button>
            <Spacer />
            <FormControl>
              <Select
                id="number"
                onChange={handleSelectedSongChange}
                aria-label="select another"
                value={songId}
              >
                {songHistory.map(({ name, id }) => (
                  <option key={`${id}`} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
        </Box>
        <Spacer />
        <AudioControls projectId={projectId} />
        <Spacer />
        <Evaluation projectId={projectId} songId={songId} />
      </Flex>
    </FormControl>
  );
}
