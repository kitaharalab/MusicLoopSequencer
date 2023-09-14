import axios from "axios";

export default function createMusic(projectid, linesY, max) {
  const excitementArray = new Array(32);
  const range = Math.floor(linesY.length / excitementArray.length);
  const excitementStep = 5;
  console.log(range);
  for (let i = 0; i < excitementArray.length; i++) {
    const sliceExcitementValues = linesY.slice(i * range, (i + 1) * range);
    const total = sliceExcitementValues.reduce((sum, value) => sum + value);
    excitementArray[i] = Math.floor(
      (total / (max * (range + 1))) * excitementStep,
    );
  }
  const url = `${import.meta.env.VITE_SERVER_URL}/projects/${String(
    projectid,
  )}/songs`;

  const data = {
    curves: excitementArray, // 盛り上がり度曲線のパラメーターを格納した配列をJSONデータにする
  };

  return axios
    .post(url, data) // サーバーから音素材の配列を受け取った後，then部分を実行する．
    .then((response) => response.data);
}
