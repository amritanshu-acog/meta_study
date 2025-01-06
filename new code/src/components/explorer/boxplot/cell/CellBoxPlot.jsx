import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const BoxPlot = ({
  plotData,
  split_prop,
  canvasRef,
  zoomEnabled,
  resetZoom,
  scope,
  mode,
}) => {
  const mockStatAnnotations = plotData.split_mode_res.statannotations;

  const zoomBehaviorRef = useRef(null);

  useEffect(() => {
    // Dimensions and margins
    const margin = { top: 60, right: 50, bottom: 200, left: 50 };
    const outerWidth = 1160;
    const outerHeight = 600;
    const width = outerWidth - margin.left - margin.right;
    const height = outerHeight - margin.top - margin.bottom;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Handle device pixel ratio
    const devicePixelRatio = window.devicePixelRatio || 1;
    canvas.width = outerWidth * devicePixelRatio;
    canvas.height = outerHeight * devicePixelRatio;
    canvas.style.width = `${outerWidth}px`;
    canvas.style.height = `${outerHeight}px`;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    const zoom = d3
      .zoom()
      .scaleExtent([1, 5])
      .translateExtent([
        [0, 0],
        [outerWidth, outerHeight],
      ])
      .on("zoom", (event) => draw(event.transform));

    d3.select(canvas).call(zoom);
    zoomBehaviorRef.current = zoom; // Store zoom behavior reference

    // Initial draw

    const draw = (transform) => {
      ctx.clearRect(0, 0, outerWidth, outerHeight);

      const totalPlotWidth = width;
      const horizontalCenterOffset = (outerWidth - totalPlotWidth) / 2;

      ctx.save();
      ctx.translate(
        margin.left + (transform.k > 1 ? transform.x : 0),
        margin.top + (transform.k > 1 ? transform.y : 0)
      );
      ctx.scale(transform.k, transform.k);

      const data =
        mode === "split"
          ? plotData.split_mode_res.plot_data
          : plotData.merge_mode_res.plot_data;
      const groups = split_prop;
      const xLabels = data.x_axis_val;
      const dataMap = new Map();

      data.x_axis_val_proportion.forEach((expr, i) => {
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
        .domain([0, d3.max(data.x_axis_val_proportion) * 1.1])
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

      // X-Axis labels
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      xLabels.forEach((xVal) => {
        const xPos = xScale(xVal) + xSubScale.bandwidth() / 2;
        ctx.save();
        ctx.translate(xPos, height + 10);
        ctx.rotate(Math.PI / 2);
        ctx.fillText(xVal, 0, 0);
        ctx.restore();
      });

      // Y-Axis ticks
      yScale.ticks(10).forEach((yTick) => {
        const yPos = yScale(yTick);
        ctx.strokeStyle = "#e0e0e0";
        ctx.beginPath();
        ctx.moveTo(0, yPos);
        ctx.lineTo(width, yPos);
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(yTick, -5, yPos + 4);
      });

      // Draw box plots and annotations
      xLabels.forEach((xVal) => {
        groups.forEach((group) => {
          const key = `${xVal}_${group}`;
          const filteredData = dataMap.get(key) || [];
          if (filteredData.length === 0) return;

          const q1 = d3.quantile(filteredData, 0.25);
          const median = d3.median(filteredData);
          const q3 = d3.quantile(filteredData, 0.75);
          const interQuantileRange = q3 - q1;
          const lowerWhisker = Math.max(
            q1 - 1.5 * interQuantileRange,
            d3.min(filteredData)
          );
          const upperWhisker = Math.min(
            q3 + 1.5 * interQuantileRange,
            d3.max(filteredData)
          );

          const xBox = xScale(xVal) + xSubScale(group);
          const yBoxTop = yScale(q3);
          const yBoxBottom = yScale(q1);

          if (!isNaN(q1) && !isNaN(q3) && !isNaN(median)) {
            ctx.fillStyle = colorScale(group);
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

            ctx.beginPath();
            ctx.moveTo(midX, yLowerWhisker);
            ctx.lineTo(midX, yBoxBottom);
            ctx.moveTo(midX, yBoxTop);
            ctx.lineTo(midX, yUpperWhisker);
            ctx.stroke();

            const capWidth = xSubScale.bandwidth() / 2;
            ctx.beginPath();
            ctx.moveTo(midX - capWidth / 2, yLowerWhisker);
            ctx.lineTo(midX + capWidth / 2, yLowerWhisker);
            ctx.moveTo(midX - capWidth / 2, yUpperWhisker);
            ctx.lineTo(midX + capWidth / 2, yUpperWhisker);
            ctx.stroke();
          }
        });

        // Highlight box plots if they match any entry in the scope array
        if (mockStatAnnotations) {
          const annotation = mockStatAnnotations[xVal];

          if (annotation) {
            const calculateBracket = (start, end, label, yOffset) => {
              if (!split_prop.includes(start) || !split_prop.includes(end))
                return; // Ensure both groups exist

              const xStart =
                xScale(xVal) + xSubScale(start) + xSubScale.bandwidth() / 2;
              const xEnd =
                xScale(xVal) + xSubScale(end) + xSubScale.bandwidth() / 2;

              const yAnnotation =
                yScale(d3.max(data.x_axis_val_proportion)) * 0.9 - yOffset;

              ctx.save();
              ctx.fillStyle = label === "ns" ? "gray" : "black";
              ctx.textAlign = "center";
              ctx.font = "12px sans-serif";
              ctx.fillText(label, (xStart + xEnd) / 2, yAnnotation - 10);
              ctx.restore();

              // Draw brackets for comparison
              const bracketHeight = 5;
              ctx.beginPath();
              ctx.moveTo(xStart, yAnnotation);
              ctx.lineTo(xStart, yAnnotation - bracketHeight);
              ctx.lineTo(xEnd, yAnnotation - bracketHeight);
              ctx.lineTo(xEnd, yAnnotation);
              ctx.strokeStyle = "black";
              ctx.lineWidth = 1;
              ctx.stroke();
            };
            // console.log("Error here");
            Object.keys(annotation).forEach((key, index) => {
              const [start, end] = key.split("_");
              if (annotation[key]) {
                const yOffset = 30 * index; // Increase yOffset for each annotation
                calculateBracket(start, end, annotation[key], yOffset);
              }
            });
          }
        }
        if (Array.isArray(scope) && scope.includes(xVal)) {
          const xHighlight = xScale(xVal);
          const yHighlight = yScale(d3.max(data.x_axis_val_proportion) * 1.1);
          const highlightHeight = height - yHighlight;

          ctx.save();
          ctx.strokeStyle = "#2196f3";
          ctx.setLineDash([3, 5]);
          ctx.lineWidth = 1;
          ctx.strokeRect(
            xHighlight,
            yHighlight,
            xScale.bandwidth(),
            highlightHeight
          );
          ctx.restore();
        }
      });

      ctx.restore();
    };

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
      d3.select(canvas).on(".zoom", null);
    };
  }, [plotData, canvasRef, zoomEnabled, mode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ cursor: zoomEnabled ? "grab" : "auto" }}
    ></canvas>
  );
};

export default BoxPlot;
