import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import insertSound from './insertSound';
import onMusicLoop from './onMusicLoop';
import { setPos } from './redux/blockCanvasSlice';
import { setMusicLoopId } from './redux/musicLoopSlice';
import { setJson } from './redux/soundDataSlice';
import { setParts } from './redux/soundsSlice';
import { setId } from './redux/songIdSlice';

export default function MusicLoops() {
    // const selectedMeasureId = useSelector((state) => state.block.posRectX);
    // const selectedPartId = useSelector((state) => state.block.posRectY)
    const musicLoopId = useSelector((state) => state.musicLoop.musicLoopId)
    const [audio, setAudio] = useState(null);
    const [currentMusicLoop, setCurrentMusicLoop] = useState(null);
    const parts = useSelector((state) => state.sounds.parts)
    const measureId = useSelector((state) => state.canvas.measureId)
    const partId = useSelector((state) => state.canvas.partId)
    const projectId = useSelector((state) => state.projectId.projectId)
    const xCoordinate = useSelector((state) => state.musicData.xCoordinate)
    const yCoordinate = useSelector((state) => state.musicData.yCoordinate)
    const rangeList = useSelector((state) => state.musicData.rangeList)
    const dispatch = useDispatch();
    const canvasRef = useRef();


    //const clickRect = ({ nativeEvent }) => {
    //    const { offsetX, offsetY } = nativeEvent;
    //    dispatch(setPos({ offsetX, offsetY }))


    //};

    const sleep = (waitMsec) => {
        var startMsec = new Date();

        // 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
        while (new Date() - startMsec < waitMsec);
    };



    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.clearRect(0, 0, 400, 400);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        let range_pos = 0;
        for (var i = 0; i < xCoordinate.length; i++) {
            if (range_pos != 4) {
                if (i == Number(rangeList[range_pos])) {
                    range_pos += 1;
                }
            }
            if (range_pos == 0) {
                ctx.fillStyle = 'gray';
            } else if (range_pos == 1) {
                ctx.fillStyle = 'blue';
            } else if (range_pos == 2) {
                ctx.fillStyle = 'green';
            } else if (range_pos == 3) {
                ctx.fillStyle = 'yellow';
            } else {
                ctx.fillStyle = 'red';
            }
            ctx.beginPath();

            ctx.arc(xCoordinate[i], yCoordinate[i], 4, 0, Math.PI * 2, false);
            ctx.fill();
            ctx.stroke()
            ctx.closePath();
        }

    }, [rangeList]);





    return (
        <canvas ref={canvasRef} width="400" height="400" id="canvas3" onMouseMove={async ({ nativeEvent }) => {
            const { offsetX, offsetY } = nativeEvent
            dispatch(setMusicLoopId(null))
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = 'black';
            ctx.clearRect(0, 0, 400, 400);
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            let range_pos = 0;
            for (let i = 0; i < xCoordinate.length; i++) {
                if (range_pos != 4) {
                    if (i == Number(rangeList[range_pos])) {
                        range_pos += 1;
                    }
                }
                if (range_pos == 0) {
                    ctx.fillStyle = 'gray';
                } else if (range_pos == 1) {
                    ctx.fillStyle = 'blue';
                } else if (range_pos == 2) {
                    ctx.fillStyle = 'green';
                } else if (range_pos == 3) {
                    ctx.fillStyle = 'yellow';
                } else {
                    ctx.fillStyle = 'red';
                }
                ctx.beginPath();

                ctx.arc(xCoordinate[i], yCoordinate[i], 4, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.stroke()
                ctx.closePath();
            }

            for (let i = 0; i < xCoordinate.length; i++) {
                if (Math.sqrt((xCoordinate[i] - offsetX) * (xCoordinate[i] - offsetX) + (yCoordinate[i] - offsetY) * (yCoordinate[i] - offsetY)) <= 4) {
                    ctx.fillStyle = 'black';
                    ctx.beginPath();

                    ctx.arc(xCoordinate[i], yCoordinate[i], 4, 0, Math.PI * 2, false);
                    ctx.fill();
                    ctx.stroke()
                    ctx.closePath();
                    dispatch(setMusicLoopId(i))
                    if (currentMusicLoop != i) {
                        dispatch(setMusicLoopId(i))
                        const test = await onMusicLoop(partId, i);
                        setAudio(test)
                        test.play()
                        setCurrentMusicLoop(i)
                    }
                }
            }
        }}
            onMouseDown={async ({ nativeEvent }) => {
                const { offsetX, offsetY } = nativeEvent
                for (let i = 0; i < xCoordinate.length; i++) {
                    if (Math.sqrt((xCoordinate[i] - offsetX) * (xCoordinate[i] - offsetX) + (yCoordinate[i] - offsetY) * (yCoordinate[i] - offsetY)) <= 4) {
                        let a = {
                            "partid": 1,
                            "measure": 2,
                            "soundId": 300
                        }
                        const music = await insertSound(projectId, partId, measureId, musicLoopId, parts)
                        dispatch(setParts(music.parts))
                        dispatch(setId(music.songid))

                    }
                }

            }
            }


        ></canvas >
    );
}