import axios from "axios";

export default function createMusic(projectid, linesY) {
  const excitementArray = new Array(32);
  for (let i = 0; i < 32; i++) {
    // １ブロックの範囲を決定
    const blockStart = Math.floor(i * 36);
    const blockFinish = Math.floor(blockStart + 36);
    // ブロックの合計から平均を計算
    let blockTotal = 0;
    for (let j = blockStart; j < blockFinish; j++) {
      blockTotal += Math.abs(linesY[j]);

      excitementArray[i] = Math.floor(blockTotal / 36 / 56);
    }
  }
  console.log("button pushed");
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
