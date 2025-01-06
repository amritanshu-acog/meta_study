import React, { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";

const DotPlot = ({ plotData, xAxisData, sizeBy, colorBy, originalData }) => {
  const canvasRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {


    if (!plotData || !plotData.Term || !plotData.Term.length) {
      // If there are no terms in the data, show a message and clear the canvas
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove(); // Clear the SVG
      svg.append("text")
        .attr("x", "50%")
        .attr("y", "50%")
        .attr("text-anchor", "middle")
        .style("font-size", "20px")
        .style("fill", "black")
        .text("No data available");

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      return;
    }
    
    // Map the filteredData just like you did with originalData
    const data = plotData.Term.map((term, index) => ({
      term,
      xAxisValue: plotData[xAxisData][index],
      sizeValue: plotData[sizeBy][index],
      colorValue: plotData[colorBy][index],
      overlap: plotData.Overlap[index],
      overlapPercent: plotData["Overlap Percent"][index],
      pValue: plotData["P-value"][index],
      adjustedPValue: plotData["Adjusted P-value"][index],
      combinedScore: plotData["Combined Score"][index],
      oddsRatio: plotData["Odds Ratio"][index],
    }));

    const margin = { top: 50, right: 250, bottom: 60, left: 400 };
    const blockHeight = 30;
    const height = data.length * blockHeight + margin.top + margin.bottom;
    const width = 950 - margin.left - margin.right;

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.xAxisValue)])
      .nice()
      .range([margin.left, width + margin.left]);

    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.term))
      .range([margin.top, height - margin.bottom])
      .padding(0.05);

    const maxSizeValue = d3.max(data, (d) => d.sizeValue);
    const maxColorValue = d3.max(data, (d) => d.colorValue);
    const minColorValue = d3.min(data, (d) => d.colorValue);

    const sizeScale = d3.scaleLinear().domain([0, maxSizeValue]).range([2, 10]);
    const colorScale = d3
      .scaleLinear()
      .domain([minColorValue, maxColorValue])
      .range(["red", "blue"]);

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = width + margin.left + margin.right;
    canvas.height = height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height);

    // Add numbers to the x-axis without lines
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .style("font-size", "12px");

    // Add vertical blocks for y-axis (terms)
    svg
      .selectAll(".term-block")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.term))
      .attr("width", width)
      .attr("height", y.bandwidth())
      .attr("fill", "#e7ecf6");

    // Add y-axis numbers beside the blocks
    svg
      .append("g")
      .selectAll(".term-label")
      .data(data)
      .enter()
      .append("text")
      .attr("x", margin.left - 10)
      .attr("y", (d) => y(d.term) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .text((d) => d.term)
      .style("font-size", "13px");

    // Add x-axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2 + margin.left)
      .attr("y", height - margin.bottom + 40)
      .text(xAxisData);

    // Add y-axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2)
      .attr("y", margin.left - 300)
      .attr("transform", "rotate(-90)")
      .text("Terms");

    // Add gradient color bar
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "colorGradient")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "blue");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "red");

    svg
      .append("rect")
      .attr("x", width + margin.left + 20)
      .attr("y", margin.top)
      .attr("width", 20)
      .attr("height", height - margin.top - margin.bottom)
      .style("fill", "url(#colorGradient)");

    svg
      .append("text")
      .attr("x", width + margin.left + 30)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .text(colorBy);

    // Add numbers to the color gradient
    const colorAxisScale = d3
      .scaleLinear()
      .domain([maxColorValue, minColorValue]) // Switch domain order
      .range([margin.top, height - margin.bottom]);

    svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 45},0)`)
      .call(d3.axisRight(colorAxisScale).ticks(5))
      .style("font-size", "10px");

    // Draw the dots on the canvas
    data.forEach((d) => {
      context.beginPath();
      const cx = x(d.xAxisValue);
      const cy = y(d.term) + y.bandwidth() / 2;
      const r = sizeScale(d.sizeValue);
      context.arc(cx, cy, r, 0, 2 * Math.PI);
      context.fillStyle = colorScale(d.colorValue);
      context.fill();
    });

    // Handle tooltip display logic
    const displayTooltip = (event) => {
      const pointer = d3.pointer(event, canvas);
      const xPointer = pointer[0];
      const yPointer = pointer[1];

      let tooltipVisible = false;

      data.forEach((d) => {
        const cx = x(d.xAxisValue);
        const cy = y(d.term) + y.bandwidth() / 2;
        const r = sizeScale(d.sizeValue);

        const xDist = xPointer - cx;
        const yDist = yPointer - cy;
        const distance = Math.sqrt(xDist * xDist + yDist * yDist);

        const thresholdDistance = r + 5; // A small buffer zone around the dot
        if (distance < thresholdDistance) {
          tooltipVisible = true;
          tooltipRef.current.style.opacity = 0.9;
          tooltipRef.current.style.left = `${cx + r + 5}px`;
          tooltipRef.current.style.top = `${cy}px`;
          tooltipRef.current.innerHTML = `
            <strong>Term:</strong> ${d.term}<br/>
            <strong>Overlap:</strong> ${d.overlap}<br/>
            <strong>Overlap Percent:</strong> ${d.overlapPercent}%<br/>
            <strong>-log10P-value:</strong> ${-Math.log10(d.pValue)}<br/>
            <strong>-log10Adjusted P-value:</strong> ${-Math.log10(
              d.adjustedPValue
            )}<br/>
            <strong>Odds Ratio:</strong> ${d.oddsRatio}<br/>
            <strong>Combined Score:</strong> ${d.combinedScore}
          `;
        }
      });

      // Hide tooltip if no dot is close enough
      if (!tooltipVisible) {
        tooltipRef.current.style.opacity = 0;
      }
    };

    canvas.addEventListener("mousemove", displayTooltip);
    return () => {
      canvas.removeEventListener("mousemove", displayTooltip);
    };
  }, [plotData, xAxisData, sizeBy, colorBy, originalData]);

  return (
    <Box position="relative" margin="0px 0" height="100%" overflowY="scroll">
      <svg
        ref={svgRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
      />
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 1 }}
      />
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          textAlign: "left",
          width: "max-content",
          padding: "5px 7px",
          font: "12px sans-serif",
          background: "#000000d9",
          color: "#fff",
          border: "0px",
          borderRadius: "8px",
          pointerEvents: "none",
          opacity: 0,
          zIndex: 1000,
        }}
      ></div>
    </Box>
  );
};

export default DotPlot;
