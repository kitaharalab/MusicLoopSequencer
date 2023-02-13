import logo from './logo.svg';
import './App.css';
import React,{useState,useEffect} from "react"

function App() {
    const canvas1 = document.getElementById('canvas');
    const ctx1 = canvas1.getContext('2d');
  
    const canvas2 = document.getElementById('canvas');
    const ctx2 = canvas1.getContext('2d');
  
    useEffect(() => {
      ctx1.width = window.innerWidth * 2;
        ctx1.height = window.innerHeight * 2;
        ctx1.style.width = `${window.innerWidth}px`;
        ctx1.style.height = `${window.innerHeight}px`;
      ctx1.fillStyle = 'green';
      ctx1.fillRect(10, 10, 150, 100);
      },[]);

    const [context,setContext] = useState(null)
    // 画像読み込み完了トリガー
    const [loaded,setLoaded] = useState(false)
    // コンポーネントの初期化完了後コンポーネント状態にコンテキストを登録
    useEffect(()=>{
      const canvas = document.getElementById("canvas");
      const ctx1 = canvas.getContext("2d");
      setContext(ctx1);
      ctx1.fillStyle = 'green';
      ctx1.fillRect(10, 10, 150, 100);
    },[])
  
    return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;


let temp = Math.floor((posY+(offsetY-posY) * (posX + i - posX) / (offsetX - posX)));
			    setLinesY(linesY.map((pos, index) => (index === (posX + i) ? temp : pos)));
          let temp = Math.floor((posY+(offsetY-posY) * (posX - i - posX) / (offsetX - posX)));
			    setLinesY(linesY.map((pos, index) => (index === (posX - i) ? temp : pos)));

          setTemp(Number(posY+(offsetY-posY) * (posX + i - posX) / (offsetX - posX)))
        let newCount = count + 1;
        setCount(newCount)
        setLinesY(linesY => linesY.map((pos, index) => (index === (posX + i) ? Number(posY+(offsetY-posY) * (posX + i - posX) / (offsetX - posX)) : pos)))
        setNumberi(i)
        setTemp(Number(posY+(offsetY-posY) * (posX - i - posX) / (offsetX - posX)))
        let newCount = count + 1;
        setCount(newCount)
        setLinesY(linesY => linesY.map((pos, index) => (index === (posX - i) ? Number(posY+(offsetY-posY) * (posX - i - posX) / (offsetX - posX)) : pos)))
        setNumberi(i)
        <canvas width="1280" height="720" id="canvas2" onMouseDown={() => setCount(count+1)}></canvas>
        const canvas2 = document.getElementById('canvas2');
    const ctx2 = canvas2.getContext('2d');
    setContext2(ctx2);
    ctx2.fillStyle = 'green';
    ctx2.fillRect(10, 10, 150, 100);

    <svg width="1152px" height="1400px" viewBox="0 0 1152 1152">
        {(() => {
          const items = [];
          for(let i = 0;i < 32; i++) {
            for(let j = 0; j < 4; j++) {
              let x = 36 * i;
              let y = 50 * j;
              const tag = <rect x={x} y={y} width="36px" height="50px" fill="white" stroke='black' onMouseDown={() => clickRect(i,j)}></rect>  
              items.push(tag)
            }
          }
          return items;
        })()}
      </svg>

let mineType = response.headers["content-type"];
const name = response.headers["content-dispositon"]
const blob = new Blob([response.data], { type: mineType});
const tempAudio = new Audio(response)
setAudio(tempAudio);
audio.play();
const test1 = new Audio(Sound)
const newCount = count + 1;
setCount(newCount)
test1.play();

{(() => {
  const items = [];
  for(let i = 0;i <= 56; i++) {
    let tag = ""; 
    if(i = 0) { 
      tag = <option value={String(i)}selected>String(i)</option>
    }else{
      tag = <option value={String(i)}>String(i)</option>
    }
    items.push(tag)
  }
  return items;
})()}