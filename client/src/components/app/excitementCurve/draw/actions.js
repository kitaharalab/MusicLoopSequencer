import * as d3 from "d3";

export function handleMouseDown(event) {
  if (!event.clientX) {
    if (event.targetTouches.length > 1) {
      return {};
    }
    const rect = event.target.getBoundingClientRect();
    const x = event.targetTouches[0].clientX - rect.left;
    const y = event.targetTouches[0].clientY - rect.top;
    return { x, y };
  }

  const { offsetX, offsetY } = event.nativeEvent;
  return { x: offsetX, y: offsetY };
}

export function handleMouseMove(
  { nativeEvent },
  curve,
  curveMax,
  canvas,
  position,
) {
  if (!canvas) {
    return {};
  }

  const ctx = canvas.getContext("2d");
  const { height, width } = ctx.canvas;
  const { offsetX, offsetY } = nativeEvent;

  const inverseX = d3.scaleLinear().domain([0, width]).range([0, curve.length]);
  const inverseY = d3.scaleLinear().domain([height, 0]).range([0, curveMax]);

  const originalPos = { x: offsetX, y: offsetY };
  const pos = { x: Math.floor(inverseX(offsetX)), y: inverseY(offsetY) };
  const cur = { x: Math.floor(inverseX(position.x)), y: inverseY(position.y) };

  const newCurve = [...curve];
  newCurve[pos.x] = pos.y;

  // liner scale
  const [left, right] = pos.x < cur.x ? [pos, cur] : [cur, pos];
  if (Math.abs(left.x - right.x) !== 0) {
    const tan = parseFloat(left.y - right.y) / (left.x - right.x);
    const dis = Math.abs(left.x - right.x);
    for (let i = 0; i < dis && left.x + i < newCurve.length; i++) {
      const x = left.x + i;
      const y = left.y + tan * i;
      newCurve[x] = y;
    }
  }

  return { position: originalPos, curve: newCurve };
}
