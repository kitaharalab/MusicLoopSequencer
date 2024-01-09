import axios from "axios";

export default async function onMusicLoop(
  projectId,
  songId,
  partId,
  musicLoopId,
  user,
) {
  if (!user) {
    return Promise.reject(new Error("User is not signed in"));
  }

  const url = `${import.meta.env.VITE_SERVER_URL}/parts/${String(
    partId,
  )}/musicloops/${String(musicLoopId)}/wav`;

  const response = await axios.get(url, { responseType: "blob" });

  const FILE = window.URL.createObjectURL(
    new Blob([response.data], { type: "audio/wav" }),
  );
  const data = new Audio(FILE);

  // ログをとるためのPOSTリクエスト
  const idToken = await user.getIdToken();
  axios.post(
    url,
    { projectId, songId },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
  return data;
}
