import axios from "axios";

import { auth } from "./authentication/firebase";

export async function getEvaluation(projectId, songId) {
  if (songId == null || projectId == null) {
    return 0;
  }
  const idToken = await auth.currentUser?.getIdToken();
  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;
  const { data } = await axios
    .get(url, {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
    .catch(() => ({ data: { evaluation: 0 } }));
  const { evaluation } = data;
  return evaluation;
}

export async function sendEvaluation(projectId, songId, evaluation) {
  if (songId == null || projectId == null) {
    return;
  }

  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;

  const idToken = await auth.currentUser?.getIdToken();
  axios.post(
    url,
    { evaluation },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
}
