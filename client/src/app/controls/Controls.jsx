import React, { useEffect, useState } from "react";
import {
  FormControl,
  Button,
  Box,
  Flex,
  Spacer,
  Select,
} from "@chakra-ui/react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import createMusic from "../../createMusic";
import { setSongId } from "../../redux/songIdSlice";
import AudioControls from "./AudioControls";
import Evaluation from "./Evaluation";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const { lines, max } = useSelector((state) => state.lines1);
  const songId = useSelector((state) => state.songId.songId);
  const [songHistory, setSongHistory] = useState([]);
  const [_asdf, setasdf] = useState([0]);
  const baseUrl = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;

  const handleSelectedSongChange = (e) => {
    setasdf(e.target.value);
    const selectSongId = e.target.value;
    dispatch(setSongId(selectSongId));
  };

  useEffect(() => {
    // 現在のプロジェクトで作られた曲の履歴を取得
    const songHistoryURL = `${baseUrl}/songs`;
    axios.get(songHistoryURL).then((response) => {
      // setasdf(1234);
      const savedSongIds = response.data.songids;
      setSongHistory(savedSongIds.map((id) => ({ name: id, id })));
    });
  }, []);

  return (
    <FormControl>
      <Flex>
        <Box>
          <Flex>
            <Button
              type="button"
              onClick={async () => {
                const music = await createMusic(projectId, lines, max);
                dispatch(setSongId(music.songid));
                setSongHistory([
                  ...songHistory,
                  { name: music.songid, id: music.songid },
                ]);
              }}
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
                  <option key={`${name}${id}`} value={id}>
                    {name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </Flex>
        </Box>
        <Spacer />
        <AudioControls />
        <Spacer />
        <Evaluation />
      </Flex>
    </FormControl>
  );
}
