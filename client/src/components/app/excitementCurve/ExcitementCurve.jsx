import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import CurveCanvas from "./CurveCanvas";

import {
  getExcitementCurve,
  getPresetCurve,
} from "@/api/song/getExcitementCurve";
import { useUser } from "@/components/Auth";
import { getApiParams } from "@/redux/apiParamSlice";

export default function ExcitementCurve({ measure }) {
  const [curve, setCurve] = useState([]);
  const [curveMax, setCurveMax] = useState(5);
  const { projectId, songId } = useSelector(getApiParams);
  const user = useUser();

  useEffect(() => {
    (async () => {
      const { curve: initCurve, max } = await getExcitementCurve(
        projectId,
        songId,
        user,
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
