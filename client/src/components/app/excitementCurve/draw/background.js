function drawBackgroundOutline(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "black";
  ctx.strokeStyle = "black";
  ctx.lineWidth = "3";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);
  ctx.fill();
}

function drawBackgroundGrid(canvas, measure, division = 5) {
  const ctx = canvas.getContext("2d");
  const width = canvas.clientWidth;

  const gridWidth = width / measure;
  const gridHeight = canvas.clientHeight / division;

  for (let i = 0; i < measure; i++) {
    ctx.beginPath();
    ctx.lineWidth = (((i + 1) % 2) + 1) * 0.5;
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.moveTo(gridWidth * i, 0);
    ctx.lineTo(gridWidth * i, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < division; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0,0,0,0.1)";
    ctx.moveTo(0, gridHeight * i);
    ctx.lineTo(canvas.width, gridHeight * i);
    ctx.stroke();
  }
}

function drawLineGrid(canvas, curve, curveMax, measure, division = 5) {
  if (!curve || curve.length === 0) {
    return;
  }
  const ctx = canvas.getContext("2d");
  const { width, height } = ctx.canvas;

  const gridWidth = width / measure;
  const gridHeight = height / division;
  const gridCurveWidth = Math.floor(curve.length / measure);
  ctx.fillStyle = "rgba(0,0,0,0.1)";
  for (let i = 0; i < measure; i++) {
    const [left, right] = [i * gridCurveWidth, (i + 1) * gridCurveWidth];
    const gridLine = curve.slice(left, right);
    const gridLineAvg = Math.floor(
      gridLine.reduce((a, b) => a + b, 0) / gridLine.length,
    );
    ctx.fillRect(
      i * gridWidth,
      (curveMax - 1 - gridLineAvg) * gridHeight,
      gridWidth,
      gridHeight,
    );
  }
}

function drawBackground(canvas, measure) {
  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  ctx.fill();
  drawBackgroundGrid(canvas, measure);
  drawBackgroundOutline(canvas);

  const isExperimental = Boolean(import.meta.env.VITE_MODE_EXPERIMENTAL);
  if (isExperimental) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    ctx.fillRect(0, 0, canvas.clientWidth, canvas.clientHeight);
  }
}

export { drawBackground, drawLineGrid };
