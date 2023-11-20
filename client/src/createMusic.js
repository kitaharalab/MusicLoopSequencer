import axios from "axios";

import { auth } from "./components/authentication/firebase";

export default async function createMusic(projectid, linesY, max) {
  const excitementArray = new Array(32);
  const range = Math.floor(linesY.length / excitementArray.length);
  const excitementStep = 5;
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
    rawCurve: linesY,
    curveMax: max,
  };
  const modeParam = {
    fix: import.meta.env.VITE_MODE_FIX,
    structure: import.meta.env.VITE_MODE_STRUCTURE,
    adapt: import.meta.env.VITE_MODE_ADAPT,
  };

  const idToken = await auth.currentUser?.getIdToken();
  const response = await axios.post(
    url,
    { ...data, ...modeParam },
    {
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    },
  );
  const { data: responseData } = response;

  return responseData;
}
