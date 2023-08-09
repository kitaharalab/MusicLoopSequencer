import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPos } from "./redux/soundsSlice";
import { setCanvas } from "./redux/blockCanvasSlice";
import axios from "axios";

export default function selectBlock(partId) {
  const url = "http://127.0.0.1:8080/parts/" + String(partId) + "/sounds";

  return axios
    .get(url) //サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then(function (response) {
      return response.data;
    });
}
