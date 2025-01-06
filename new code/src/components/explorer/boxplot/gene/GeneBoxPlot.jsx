import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const GeneBoxPlotCanvas = ({
  canvasRef,
  genePlotData,
  split_prop,
  resetZoom,
  zoomEnabled,
}) => {
  // const canvasRef = useRef(null);
  const zoomRef = useRef(null);

  useEffect(() => {
    const margin = { top: 40, right: 50, bottom: 200, left: 50 };
    const outerWidth = 1160;
    const outerHeight = 600;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = outerWidth * devicePixelRatio;
    canvas.height = outerHeight * devicePixelRatio;
    canvas.style.width = `${outerWidth}px`;
    canvas.style.height = `${outerHeight}px`;

    ctx.scale(devicePixelRatio, devicePixelRatio);

    const data = genePlotData;
    const groups = split_prop;
    const xLabels = data.x_axis_val;
    const dataMap = new Map();
    data.mean_expr.forEach((expr, i) => {
      const xVal = data.x_axis_val[i];
      const group = data.split_by_val[i];
      const key = `${xVal}_${group}`;
      if (!dataMap.has(key)) {
        dataMap.set(key, []);
      }
      dataMap.get(key).push(expr);
    });

    const xScale = d3
      .scaleBand()
      .domain(xLabels)
      .range([0, width])
      .padding(0.2);
    const xSubScale = d3
      .scaleBand()
      .domain(groups)
      .range([0, xScale.bandwidth()])
      .padding(0.05);
    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data.mean_expr) * 1.1])
      .nice()
      .range([height, 0]);
    const colorScale = d3
      .scaleOrdinal()
      .domain(groups)
      .range([
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
      ]);

    const draw = (transform) => {
      ctx.save();
      ctx.clearRect(0, 0, outerWidth, outerHeight);
      ctx.translate(
        margin.left + (transform.k > 1 ? transform.x : 0),
        margin.top + (transform.k > 1 ? transform.y : 0)
      );
      ctx.scale(transform.k, transform.k);

      // Draw axes labels
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";

      // X-axis labels
      xLabels.forEach((xVal) => {
        const xPos = xScale(xVal) + xSubScale.bandwidth() / 2;
        ctx.save();
        ctx.translate(xPos, height + 10);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(xVal, 0, 0);
        ctx.restore();
      });

      // Y-axis labels and grid lines
      yScale.ticks().forEach((yTick) => {
        const yPos = yScale(yTick);
        ctx.strokeStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.fillText(yTick, -5, yPos + 4);
      });

      // Draw box plots
      xLabels.forEach((xVal) => {
        groups.forEach((group) => {
          const key = `${xVal}_${group}`;
          const filteredData = dataMap.get(key);
          if (!filteredData) return;

          const q1 = d3.quantile(filteredData, 0.25);
          const median = d3.median(filteredData);
          const q3 = d3.quantile(filteredData, 0.75);
          const iqr = q3 - q1;
          const lowerWhisker = Math.max(q1 - 1.5 * iqr, d3.min(filteredData));
          const upperWhisker = Math.min(q3 + 1.5 * iqr, d3.max(filteredData));

          const xBox = xScale(xVal) + xSubScale(group);
          const yBoxTop = yScale(q3);
          const yBoxBottom = yScale(q1);

          if (!isNaN(q1) && !isNaN(q3) && !isNaN(median)) {
            ctx.fillStyle = colorScale(group);
            ctx.globalAlpha = 0.8;
            ctx.fillRect(
              xBox,
              yBoxTop,
              xSubScale.bandwidth(),
              yBoxBottom - yBoxTop
            );
            ctx.strokeStyle = "black";
            ctx.strokeRect(
              xBox,
              yBoxTop,
              xSubScale.bandwidth(),
              yBoxBottom - yBoxTop
            );

            // Median line
            const yMedian = yScale(median);
            ctx.beginPath();
            ctx.moveTo(xBox, yMedian);
            ctx.lineTo(xBox + xSubScale.bandwidth(), yMedian);
            ctx.stroke();
          }

          if (!isNaN(lowerWhisker) && !isNaN(upperWhisker)) {
            const midX = xBox + xSubScale.bandwidth() / 2;
            const yLowerWhisker = yScale(lowerWhisker);
            const yUpperWhisker = yScale(upperWhisker);

            // Whiskers
            ctx.beginPath();
            ctx.moveTo(midX, yLowerWhisker);
            ctx.lineTo(midX, yBoxBottom);
            ctx.moveTo(midX, yBoxTop);
            ctx.lineTo(midX, yUpperWhisker);
            ctx.stroke();

            // Whisker caps
            const capWidth = xSubScale.bandwidth() / 2;
            ctx.beginPath();
            ctx.moveTo(midX - capWidth / 2, yLowerWhisker);
            ctx.lineTo(midX + capWidth / 2, yLowerWhisker);
            ctx.moveTo(midX - capWidth / 2, yUpperWhisker);
            ctx.lineTo(midX + capWidth / 2, yUpperWhisker);
            ctx.stroke();
          }
        });
      });

      ctx.restore();
    };

    const zoom = d3
      .zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [outerWidth, outerHeight],
      ])
      .on("zoom", (event) => draw(event.transform));

    if (zoomEnabled) {
      d3.select(canvas).call(zoom);
    } else {
      d3.select(canvas).on(".zoom", null); // Disable zoom if not enabled
    }

    resetZoom.current = () => {
      d3.select(canvas)
        .transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
    };

    draw(d3.zoomIdentity); // Initial draw

    return () => {
      d3.select(canvas).on(".zoom", null); // Clean up the event listener on unmount
    };
  }, [genePlotData, canvasRef, zoomEnabled]);

  return (
    <canvas
      ref={canvasRef}
      style={{ cursor: zoomEnabled ? "grab" : "auto" }}
    ></canvas>
  );
};

export default GeneBoxPlotCanvas;
