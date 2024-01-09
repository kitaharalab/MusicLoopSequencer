import axios from "axios";

export default async function insertSound(
  projectId,
  songId,
  partId,
  measureId,
  musicLoopId,
  user,
) {
  if (!user) {
    return Promise.reject(new Error("User is not signed in"));
  }

  const url = new URL(
    `/projects/${projectId}/songs/${songId}/parts/${partId}/measures/${measureId}/musicloops/${musicLoopId}`,
    import.meta.env.VITE_SERVER_URL,
  );
  const modeParam = {
    fix: import.meta.env.VITE_MODE_FIX,
    structure: import.meta.env.VITE_MODE_STRUCTURE,
    adapt: import.meta.env.VITE_MODE_ADAPT,
  };

  const idToken = await user.getIdToken();
  const response = await axios.post(url, modeParam, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const { data: responseData } = response;

  return responseData;
}
