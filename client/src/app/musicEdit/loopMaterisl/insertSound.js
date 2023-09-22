import axios from "axios";

export default function insertSound(
  projectId,
  partId,
  measureId,
  musicLoopId,
  parts,
) {
  console.log("insert sound func");
  const url = `${import.meta.env.VITE_SERVER_URL}/projects/${String(
    projectId,
  )}/parts/${String(partId)}/measures/${String(measureId)}/musicloops/${String(
    musicLoopId,
  )}`;
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

  return axios
    .post(url, data) // サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then((response) => response.data);
}
