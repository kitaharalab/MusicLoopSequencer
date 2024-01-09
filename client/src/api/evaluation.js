import axios from "axios";

export async function getEvaluation(projectId, songId, user) {
  if (songId == null || projectId == null) {
    return 0;
  }
  if (!user) {
    return 0;
  }

  const idToken = await user.getIdToken();
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

export async function sendEvaluation(projectId, songId, evaluation, user) {
  if (songId == null || projectId == null) {
    return;
  }
  if (!user) {
    return;
  }

  const url = `${
    import.meta.env.VITE_SERVER_URL
  }/projects/${projectId}/songs/${songId}`;

  const idToken = await user.getIdToken();
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
