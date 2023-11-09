import axios from "axios";

import { auth } from "../../../components/authentication/firebase";

export default async function insertSound(
  projectId,
  songId,
  partId,
  measureId,
  musicLoopId,
  parts,
) {
  // TODO: partIdはindexが入ってるので，idに変換する必要がある．
  const url = new URL(
    `/projects/${projectId}/songs/${songId}/parts/${partId}/measures/${measureId}/musicloops/${musicLoopId}`,
    import.meta.env.VITE_SERVER_URL,
  );
  const sequenceList = parts[0].sounds;
  const synthList = parts[1].sounds;
  const bassList = parts[2].sounds;
  const drumsList = parts[3].sounds;

  const data = {
    sequenceList,
    synthList,
    bassList,
    drumsList, // 盛り上がり度曲線のパラメーターを格納した配列をJSONデータにする
  };

  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  const { data: responseData } = response;

  return responseData;
}
