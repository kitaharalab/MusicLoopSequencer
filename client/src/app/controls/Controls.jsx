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
import { setParts } from "../../redux/soundsSlice";
import { setSongId } from "../../redux/songIdSlice";
import AudioControls from "./AudioControls";
import Evaluation from "./Evaluation";

export default function Controls({ projectId }) {
  const dispatch = useDispatch();
  const { lines, max } = useSelector((state) => state.lines1);
  const [songHistory, setSongHistory] = useState([]);
  const [_asdf, setasdf] = useState([0]);
  const baseUrl = `${import.meta.env.VITE_SERVER_URL}/projects/${projectId}`;

  const handleChange = (e) => {
    setasdf(e.target.value);
    const selectSongId = e.target.value;
    const url = `${baseUrl}/songs/${selectSongId}`;
    axios
      .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
      .then((response) => {
        const { data } = response;
        // console.log(data);
        dispatch(setParts(data.parts));
      });
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
                console.log("get music", music);
                dispatch(setParts(music.parts));
                dispatch(setSongId(music.songid));
              }}
            >
              create
            </Button>
            <Spacer />
            <FormControl>
              <Select
                id="number"
                onChange={handleChange}
                aria-label="select another"
              >
                {songHistory.map(({ name, id }) => (
                  <option key={`${name}${id}`}>{name}</option>
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
