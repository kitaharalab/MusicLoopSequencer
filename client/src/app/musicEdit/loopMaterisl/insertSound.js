import axios from "axios";

import { auth } from "../../../components/authentication/firebase";

export default async function insertSound(
  projectId,
  songId,
  partId,
  measureId,
  musicLoopId
) {
  // TODO: partIdはindexが入ってるので，idに変換する必要がある．
  const url = new URL(
    `/projects/${projectId}/songs/${songId}/parts/${partId}/measures/${measureId}/musicloops/${musicLoopId}`,
    import.meta.env.VITE_SERVER_URL,
  );
  const modeParam = {
    fix: import.meta.env.VITE_MODE_FIX,
    structure: import.meta.env.VITE_MODE_STRUCTURE,
    adapt: import.meta.env.VITE_MODE_ADAPT,
  };

  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.post(url, modeParam, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const { data: responseData } = response;

  return responseData;
}
