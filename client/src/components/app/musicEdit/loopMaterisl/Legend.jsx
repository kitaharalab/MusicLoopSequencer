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
  return legendColor.map((color, i) => (
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
  return legendColor.map((color, i) => (
    <text
      transform={`translate(${x(i - 1)}, 0)`}
      key={color}
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

export default function Legend({ partColor, property, colors }) {
  const { boxSize, margin, barSize, padding, fontSize } = property;
  const x = d3
    .scaleLinear()
    .domain([-1, (colors?.length ?? 5) - 1])
    .rangeRound([margin.left, boxSize.width - margin.right]);

  return (
    <svg
      viewBox={`0 0 ${boxSize.width} ${boxSize.height}`}
      style={{ userSelect: "none" }}
    >
      {partColor && colors && (
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
              legendColor={colors}
              padding={padding}
              x={x}
              barSize={barSize}
            />
          </g>
          <g transform={`translate(0, ${margin.top + barSize.height})`}>
            <LegendAxis legendColor={colors} x={x} fontSize={fontSize} />
          </g>
        </>
      )}
    </svg>
  );
}
