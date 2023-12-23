import * as d3 from "d3";
import React from "react";

function LegendTitle({ margin, padding, fontSize, boxSize }) {
  return (
    <>
      <text
        x={margin.left}
        y={margin.top - padding}
        fontSize={fontSize * 0.9}
        textAnchor="start"
        alignmentBaseline="baseline"
      >
        低
      </text>
      <text
        x={boxSize.width / 2}
        y={margin.top - padding}
        fontSize={fontSize}
        textAnchor="middle"
        alignmentBaseline="baseline"
      >
        盛り上がり度
      </text>
      <text
        x={boxSize.width - margin.right}
        y={margin.top - padding}
        fontSize={fontSize * 0.9}
        textAnchor="end"
        alignmentBaseline="baseline"
      >
        高
      </text>
    </>
  );
}

function LegendContent({ legendColor, padding, x, barSize }) {
  return legendColor
    .range()
    .map((color, i) => (
      <rect
        key={color}
        x={x(i - 1)}
        y={padding}
        width={x(i) - x(i - 1)}
        height={barSize.height - padding * 2}
        fill={color}
      />
    ));
}

function LegendAxis({ legendColor, x, fontSize }) {
  return legendColor.range().map((threshold, i) => (
    <text
      transform={`translate(${x(i - 1)}, 0)`}
      key={threshold}
      x={(x(i) - x(i - 1)) / 2}
      y={0}
      textAnchor="middle"
      alignmentBaseline="hanging"
      fill="currentColor"
      fontSize={fontSize}
    >
      {i + 1}
    </text>
  ));
}

export default function Legend({ partColor, property, colorScale }) {
  const { boxSize, margin, barSize, padding, fontSize } = property;
  const domain = colorScale.domain();
  const colors = d3.range(domain[0], domain[1] + 1).map((i) => colorScale(i));
  const legendColor = d3.scaleQuantize([0, 4], colors);
  const x = d3
    .scaleLinear()
    .domain([-1, legendColor.range().length - 1])
    .rangeRound([margin.left, boxSize.width - margin.right]);

  return (
    <svg
      viewBox={`0 0 ${boxSize.width} ${boxSize.height}`}
      style={{ userSelect: "none" }}
    >
      {partColor && (
        <>
          <g transform={`translate(0, ${padding})`}>
            <LegendTitle
              margin={margin}
              padding={padding}
              fontSize={fontSize}
              boxSize={boxSize}
            />
          </g>
          <g transform={`translate(0, ${margin.top})`}>
            <LegendContent
              legendColor={legendColor}
              padding={padding}
              x={x}
              barSize={barSize}
            />
          </g>
          <g transform={`translate(0, ${margin.top + barSize.height})`}>
            <LegendAxis legendColor={legendColor} x={x} fontSize={fontSize} />
          </g>
        </>
      )}
    </svg>
  );
}
