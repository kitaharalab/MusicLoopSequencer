import axios from "axios";

export default function onMusicLoop(projectId, songId, partId, musicLoopId) {
  const url = `${import.meta.env.VITE_SERVER_URL}/parts/${String(
    partId,
  )}/musicloops/${String(musicLoopId)}/wav`;

  const data = axios
    .get(url, { responseType: "blob" }) // サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then((response) => {
      const FILE = window.URL.createObjectURL(
        new Blob([response.data], { type: "audio/wav" }),
      );
      const test1 = new Audio(FILE);
      return test1;
    });
  axios.post(url, { projectId, songId, partId, musicLoopId });
  return data;
}
