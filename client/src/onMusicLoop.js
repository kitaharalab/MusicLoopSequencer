import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setPos } from "./redux/soundsSlice";
import { setCanvas } from "./redux/blockCanvasSlice";

export default function onMusicLoop(partId, musicLoopId) {
  const url = `http://127.0.0.1:8080/parts/${String(
    partId,
  )}/musicloops/${String(musicLoopId)}/wav`;

  return axios
    .get(url, { responseType: "blob" }) // サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then((response) => {
      const FILE = window.URL.createObjectURL(
        new Blob([response.data], { type: "audio/wav" }),
      );
      const test1 = new Audio(FILE);
      return test1;
    });
}
