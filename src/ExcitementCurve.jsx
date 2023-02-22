import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStart, setDraw } from './redux/linesSlice';

export default function ExcitementCurve() {
    const linesY = useSelector((state) => state.lines1.lines);
    const dispatch = useDispatch();
    const canvasRef = useRef();
    const curveLength = 1152;
    const curveInitial = 250;
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [drawing, setDrawing] = useState(false);

    const startDraw = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setPosX(Math.floor(offsetX));
        setPosY(Math.floor(offsetY));
        dispatch(setStart({ posX, posY }))
        setDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!drawing) { return; }
        const { offsetX, offsetY } = nativeEvent;
        let array = new Array(curveLength);
        for (let i = 0; i < curveLength; i++) {
            array[i] = linesY[i]
        }

        dispatch(setDraw({ posX, posY, offsetX, offsetY }))


        setPosX(Math.floor(offsetX))
        setPosY(Math.floor(offsetY))

    };

    const stopDraw = () => {
        setDrawing(false);
    };


    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = 'black';
        ctx.strokeStyle = "black"
        ctx.lineWidth = "3"
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.lineWidth = "1"
        ctx.clearRect(0, 1, 1151, 278);
        ctx.strokeStyle = "gray"
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 5; j++) {
                ctx.strokeRect(36 * i, 56 * j, 36, 56);
            }
        }
        ctx.lineWidth = "3";
        ctx.strokeStyle = "blue"
        ctx.beginPath();
        for (var i = 0; i < 1151; i++) {
            ctx.moveTo(i, linesY[i]);          //盛り上がり度曲線を描く．
            ctx.lineTo(i + 1, linesY[i + 1]);
        }
        ctx.stroke();



    }, [linesY]);



    return (
        <canvas ref={canvasRef} width="1152" height="280" id="canvas1"
            onMouseDown={startDraw}
            onMouseUp={stopDraw}
            onMouseMove={draw}>
        </canvas>
    );
}