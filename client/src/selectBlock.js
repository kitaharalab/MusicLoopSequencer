import axios from "axios";

export default function selectBlock(partId) {
  const url = `${import.meta.env.VITE_SERVER_URL}/parts/${String(
    partId,
  )}/sounds`;

  return axios
    .get(url) // サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then((response) => response.data);
}
