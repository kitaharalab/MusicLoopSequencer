import axios from "axios";

import { auth } from "../../../components/authentication/firebase";

export default function onMusicLoop(
  projectId,
  songId,
  partId,
  musicLoopId,
  userId,
) {
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

  const idToken = auth.currentUser?.getIdToken();
  axios.post(
    url,
    { projectId, songId, partId, musicLoopId, userId },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
  return data;
}
