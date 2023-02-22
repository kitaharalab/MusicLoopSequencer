import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setPos } from './redux/blockSlice';
import { setCanvas } from './redux/blockCanvasSlice';

export default function SoundBlock() {
    const posRectX = useSelector((state) => state.block.posRectX);
    const posRectY = useSelector((state) => state.block.posRectY)
    const dispatch = useDispatch();
    const canvasRef = useRef();


    const clickRect = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        dispatch(setPos({ offsetX, offsetY }))


    };


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        dispatch(setCanvas(ctx));

        ctx.clearRect(0, 0, 1152, 200);
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = "black"
        ctx.lineWidth = 1;
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.strokeRect(36 * i, 50 * j, 36, 50);
            }
        }
        ctx.lineWidth = 6;
        ctx.strokeRect(36 * posRectX, 50 * posRectY, 36, 50);
        ctx.fill();
        ctx.lineWidth = 1;
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.strokeRect(36 * i, 50 * j, 36, 50);
            }
        }



    }, [posRectX, posRectY]);



    return (
        <canvas ref={canvasRef} width="1152" height="200" id="canvas2" onMouseDown={clickRect}></canvas>
    );
}