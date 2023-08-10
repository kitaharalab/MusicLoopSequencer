import { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setPos } from "./redux/blockCanvasSlice";
import { setMusicData } from "./redux/musicDataSlice";
import selectBlock from "./selectBlock";

export default function SoundBlock() {
  // const selectedMeasureId = useSelector((state) => state.block.posRectX);
  // const selectedPartId = useSelector((state) => state.block.posRectY)
  const parts = useSelector((state) => state.sounds.parts);
  const measureId = useSelector((state) => state.canvas.measureId);
  const partId = useSelector((state) => state.canvas.partId);
  const dispatch = useDispatch();
  const canvasRef = useRef();

  // const clickRect = ({ nativeEvent }) => {
  //    const { offsetX, offsetY } = nativeEvent;
  //    dispatch(setPos({ offsetX, offsetY }))

  // };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, 1152, 200);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    if (parts.length != 0) {
      const sequenceList = parts[0].sounds;
      const synthList = parts[1].sounds;
      const bassList = parts[2].sounds;
      const drumsList = parts[3].sounds;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 4; i++) {
        const color = "";
        if (i == 0) {
          ctx.fillStyle = "red";
        } else if (i == 1) {
          ctx.fillStyle = "yellow";
        } else if (i == 2) {
          ctx.fillStyle = "green";
        } else {
          ctx.fillStyle = "blue";
        }
        for (let j = 0; j < 32; j++) {
          if (i == 0) {
            if (sequenceList[j] != null) {
              ctx.fillRect(j * 36, i * 50, 36, 50);
            }
          } else if (i == 1) {
            if (synthList[j] != null) {
              ctx.fillRect(j * 36, i * 50, 36, 50);
            }
          } else if (i == 2) {
            if (bassList[j] != null) {
              ctx.fillRect(j * 36, i * 50, 36, 50);
            }
          } else if (drumsList[j] != null) {
            ctx.fillRect(j * 36, i * 50, 36, 50);
          }
          ctx.fill();
        }
      }
      for (let i = 0; i < 32; i++) {
        for (let j = 0; j < 4; j++) {
          ctx.strokeRect(i * 36, j * 50, 36, 50);
        }
      }
      ctx.fill();
    }

    ctx.strokeStyle = "black";
    ctx.lineWidth = 1;
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(36 * i, 50 * j, 36, 50);
      }
    }
    ctx.lineWidth = 6;
    ctx.strokeRect(36 * measureId, 50 * partId, 36, 50);
    ctx.fill();
    ctx.lineWidth = 1;
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(36 * i, 50 * j, 36, 50);
      }
    }
  }, [measureId, partId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(i * 36, j * 50, 36, 50);
      }
    }
    ctx.fill();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (parts.length === 0) {
      return;
    }
    const sequenceList = parts[0].sounds;
    const synthList = parts[1].sounds;
    const bassList = parts[2].sounds;
    const drumsList = parts[3].sounds;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 4; i++) {
      const color = "";
      if (i == 0) {
        ctx.fillStyle = "red";
      } else if (i == 1) {
        ctx.fillStyle = "yellow";
      } else if (i == 2) {
        ctx.fillStyle = "green";
      } else {
        ctx.fillStyle = "blue";
      }
      for (let j = 0; j < 32; j++) {
        if (i == 0) {
          if (sequenceList[j] != null) {
            ctx.fillRect(j * 36, i * 50, 36, 50);
          }
        } else if (i == 1) {
          if (synthList[j] != null) {
            ctx.fillRect(j * 36, i * 50, 36, 50);
          }
        } else if (i == 2) {
          if (bassList[j] != null) {
            ctx.fillRect(j * 36, i * 50, 36, 50);
          }
        } else if (drumsList[j] != null) {
          ctx.fillRect(j * 36, i * 50, 36, 50);
        }
        ctx.fill();
      }
    }
    for (let i = 0; i < 32; i++) {
      for (let j = 0; j < 4; j++) {
        ctx.strokeRect(i * 36, j * 50, 36, 50);
      }
    }
    ctx.fill();
  }, [parts]);

  return (
    <canvas
      ref={canvasRef}
      width="1152"
      height="200"
      id="canvas2"
      onMouseDown={async ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        dispatch(setPos({ offsetX, offsetY }));
        const musicData = await selectBlock(Math.floor(offsetY / 50));
        const xCoordinate = musicData.x_coordinate;
        const yCoordinate = musicData.y_coordinate;
        const rangeList = musicData.range_lists;
        dispatch(setMusicData({ xCoordinate, yCoordinate, rangeList }));
      }}
    />
  );
}
