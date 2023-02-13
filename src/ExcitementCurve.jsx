import { useEffect, useRef, useState } from 'react';

export default function ExcitementCurve() {
    const canvasRef = useRef();
    const curveLength = 1152;
    const curveInitial = 250;
    const [linesY, setLinesY] = useState(new Array(curveLength).fill(curveInitial))
    const [posX, setPosX] = useState(0);
    const [posY, setPosY] = useState(0);
    const [drawing, setDrawing] = useState(false);

    const startDraw = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setPosX(Math.floor(offsetX));
        setPosY(Math.floor(offsetY));
        setLinesY(linesY.map((pos, index) => (index === posX ? posY : pos)))
        setDrawing(true);
    };

    const draw = ({ nativeEvent }) => {
        if (!drawing) { return; }
        const { offsetX, offsetY } = nativeEvent;
        let array = new Array(curveLength);
        for (let i = 0; i < curveLength; i++) {
            array[i] = linesY[i]
        }
        array[offsetX] = offsetY;
        let difference = Math.floor((Math.abs(offsetX - posX)));
        if (offsetX > posX) {
            for (let i = 1; i < difference; i++) {
                array[posX + i] = Math.floor(posY + (offsetY - posY) * (posX + i - posX) / (offsetX - posX));
            }
        } else {
            for (let i = 1; i < difference; i++) {
                array[posX - i] = Math.floor(posY + (offsetY - posY) * (posX - i - posX) / (offsetX - posX));
            }
        }
        setLinesY([...array])

        setPosX(Math.floor(offsetX))
        setPosY(Math.floor(offsetY))

    };

    const stopDraw = () => {
        setDrawing(false);
    };


    useEffect(() => {
        const canvas1 = canvasRef.current;
        const ctx1 = canvas1.getContext('2d');

        ctx1.fillStyle = 'black';
        ctx1.strokeStyle = "black"
        ctx1.lineWidth = "3"
        ctx1.strokeRect(0, 0, canvas1.width, canvas1.height);
        ctx1.lineWidth = "1"
        ctx1.clearRect(0, 1, 1151, 278);
        ctx1.strokeStyle = "gray"
        for (let i = 0; i < 32; i++) {
            for (let j = 0; j < 5; j++) {
                ctx1.strokeRect(36 * i, 56 * j, 36, 56);
            }
        }
        ctx1.lineWidth = "3";
        ctx1.strokeStyle = "blue"
        ctx1.beginPath();
        for (var i = 0; i < 1151; i++) {
            ctx1.moveTo(i, linesY[i]);          //盛り上がり度曲線を描く．
            ctx1.lineTo(i + 1, linesY[i + 1]);
        }
        ctx1.stroke();



    }, [linesY]);



    return (
        <canvas ref={canvasRef} width="1152" height="280" id="canvas1"
            onMouseDown={startDraw}
            onMouseUp={stopDraw}
            onMouseMove={draw}>
        </canvas>
    );
}