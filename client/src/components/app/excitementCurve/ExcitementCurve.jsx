import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import CurveCanvas from "./CurveCanvas";

import {
  getExcitementCurve,
  getPresetCurve,
} from "@/api/song/getExcitementCurve";
import { getApiParams } from "@/redux/apiParamSlice";

export default function ExcitementCurve({ measure }) {
  const [curve, setCurve] = useState([]);
  const [curveMax, setCurveMax] = useState(5);
  const { projectId, songId } = useSelector(getApiParams);

  useEffect(() => {
    (async () => {
      const { curve: initCurve, max } = await getExcitementCurve(
        projectId,
        songId,
      ).catch(async () => {
        const data = await getPresetCurve(projectId);
        return data;
      });

      setCurve(initCurve);
      setCurveMax(max);
    })();
  }, [songId]);

  return (
    <CurveCanvas
      key={curve}
      curve={curve}
      curveMax={curveMax}
      measure={measure}
    />
  );
}
