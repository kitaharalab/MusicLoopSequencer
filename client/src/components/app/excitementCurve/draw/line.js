function drawLine(canvas, curve, lineScale) {
  if (!canvas) {
    return;
  }
  const isExperimental = Boolean(import.meta.env.VITE_MODE_EXPERIMENTAL);
  const ctx = canvas.getContext("2d");

  const { line } = lineScale;

  ctx.lineWidth = "3";
  ctx.strokeStyle = isExperimental ? "gray" : "blue";
  ctx.fillStyle = "transparent";

  line.context(ctx);
  ctx.beginPath();
  line(curve);
  ctx.stroke();
}

export default drawLine;
