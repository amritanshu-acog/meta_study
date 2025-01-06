import React, { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";

const DotPlot = ({ plotData, sizeBy, colorBy }) => {
  const canvasRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();

  const formatValue = (value) => {
    // Check if the value is large or small enough to require exponential notation
    return Math.abs(value) >= 1e4 || Math.abs(value) < 1e-4
      ? value.toExponential(4) // If value is large or small, use exponential
      : value.toFixed(4); // Otherwise, use normal formatting with 4 decimals
  };

  useEffect(() => {
    if (!plotData || !Array.isArray(plotData)) {
      console.error("Invalid plot data structure", plotData);
      return;
    }

    // Get all unique terms across all studies
    const allTerms = [
      ...new Set(
        plotData.flatMap((study) =>
          study.studyTermData[0].terms.map((t) => t.term)
        )
      ),
    ];

    // Get all study names
    const allStudies = plotData.map((study) => study.selectedStudy[0]);

    // Create a structured dataset for visualization
    const data = plotData.flatMap((studyData) =>
      studyData.studyTermData[0].terms.map((term) => ({
        term: term.term,
        study: studyData.selectedStudy[0],
        sizeValue: term.sizeValue,
        colorValue: term.colorValue,
      }))
    );

    // Check if there are terms for the selected result type
    const hasTerms = data.length > 0;

    if (!hasTerms) {
      // If no terms, show a message and prevent rendering the plot
      svgRef.current.innerHTML =
        "<text x='50%' y='50%' text-anchor='middle' font-size='20' fill='black'>No terms available for selected result type</text>";
      canvasRef.current
        .getContext("2d")
        .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height); // Clear the canvas
      return;
    }
    const margin = { top: 80, right: 250, bottom: 260, left: 250 };
    const blockHeight = 40;
    const height = Math.max(
      allStudies.length * blockHeight + margin.top + margin.bottom,
      440
    );
    const fixedWidth = Math.min(
      allTerms.length * blockHeight + margin.left + margin.right,
      1200
    );
    const width = fixedWidth;

    const x = d3
      .scaleBand()
      .domain(allTerms)
      .range([margin.left, width - margin.right])
      .padding(0.05);

    const y = d3
      .scaleBand()
      .domain(allStudies)
      .range([margin.top, height - margin.bottom])
      .padding(allStudies.length > 1 ? 0.2 : 0.5);

    // Calculate the max and min values for size and color
    const maxSizeValue = d3.max(data, (d) => d.sizeValue);
    const minSizeValue = d3.min(data, (d) => d.sizeValue); // Ensure minSizeValue is set
    const maxColorValue = d3.max(data, (d) => d.colorValue);
    const minColorValue = d3.min(data, (d) => d.colorValue);

    const sizeScale = d3
      .scaleLog()
      .domain([minSizeValue, maxSizeValue]) // Corrected so max value corresponds to max size
      .range([2, 10]); // Max size is 10 (for the largest circle), min size is 2 (for the smallest circle)
    // Update colorScale to reverse the color mapping (max = blue, min = red)
    const colorScale = d3
      .scaleLinear()
      .domain([maxColorValue, minColorValue]) // Reverse the domain so max is blue, min is red
      .range(["blue", "red"]); // Max value is blue, Min value is red

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, canvas.width, canvas.height);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg.attr("width", width).attr("height", height);

    // X-axis (Terms)
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px")
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-45)");

    // Y-axis (Study Names)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(0))
      .select(".domain")
      .remove();

    // Add x-axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2 - 100)
      .attr("y", height - margin.bottom + 240)
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Terms");

    // Add y-axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", -height / 2 + 90 )
      .attr("y", margin.left - 150)
      .attr("transform", "rotate(-90)")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text("Study Names");

    // Reverse the color gradient (Max value = Blue, Min value = Red)
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "colorGradientNew")
      .attr("x1", "0%")
      .attr("y1", "0%")
      .attr("x2", "0%")
      .attr("y2", "100%");

    // Max value = Blue, Min value = Red
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "blue");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "red");

    svg
      .append("rect")
      .attr("x", width - margin.right + 10)
      .attr("y", margin.top)
      .attr("width", 20)
      .attr("height", height - margin.top - margin.bottom)
      .style("fill", "url(#colorGradientNew)");

    svg
      .append("text")
      .attr("x", width - margin.right + 20)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(colorBy);

    // Reverse the color axis (Max value at top, Min value at bottom)
    const colorAxisScale = d3
      .scaleLinear()
      .domain([maxColorValue, minColorValue]) // Reverse the domain for the axis (max value at the top, min at the bottom)
      .range([margin.top, height - margin.bottom]);

    // Append color axis
    svg
      .append("g")
      .attr("transform", `translate(${width - margin.right + 30},0)`)
      .call(d3.axisRight(colorAxisScale).ticks(5))
      .style("font-size", "10px");

    //New Legend

    // Size Legend Parameters
    const sizeLegendX = width - margin.right + 120; // X position of the legend
    const sizeLegendY = margin.top; // Y position of the top of the legend
    const legendSpacing = (height - margin.top - margin.bottom) / 5 + 2;

    // Generate unique size values for the legend
    const numLegendItems = 5; // Number of items in the size legend
    const sizeLegendValues = d3.range(numLegendItems).map((i) => {
      return (
        minSizeValue +
        (i * (maxSizeValue - minSizeValue)) / (numLegendItems - 1)
      );
    });

    // Append the size legend group
    const sizeLegendGroup = svg
      .append("g")
      .attr("class", "size-legend")
      .attr("transform", `translate(${sizeLegendX},${sizeLegendY})`);

    // Add legend circles
    sizeLegendValues.forEach((value, i) => {
      sizeLegendGroup
        .append("circle")
        .attr("cx", 0) // X position relative to the legend group
        .attr("cy", i * legendSpacing) // Y position for each legend circle
        .attr("r", sizeScale(value)) // Size of the circle based on value
        .style("fill", "black");

      // Add legend labels
      sizeLegendGroup
        .append("text")
        .attr("x", 20) // Position the text slightly to the right of the circle
        .attr("y", i * legendSpacing + 4) // Align text with the circle center
        .style("font-size", "10px")
        .style("text-anchor", "start")
        .text(formatValue(value));
    });

    // Add a legend title
    sizeLegendGroup
      .append("text")
      .attr("x", -20)
      .attr("y", -10)
      .style("font-size", "12px")
      .style("font-weight", "bold")
      .text(sizeBy);

    // Draw dots (color scale should now match the gradient)
    data.forEach((d) => {
      context.beginPath();
      const cx = x(d.term) + x.bandwidth() / 2;
      const cy = y(d.study) + y.bandwidth() / 2;
      const r = sizeScale(d.sizeValue);
      context.arc(cx, cy, r, 0, 2 * Math.PI);
      context.fillStyle = colorScale(d.colorValue); // Ensure color matches the gradient
      context.fill();
    });

    // Tooltip logic
    const displayTooltip = (event) => {
      const pointer = d3.pointer(event, canvas);
      const xPointer = pointer[0];
      const yPointer = pointer[1];

      let tooltipVisible = false;

      data.forEach((d) => {
        const cx = x(d.term) + x.bandwidth() / 2;
        const cy = y(d.study) + y.bandwidth() / 2;
        const r = sizeScale(d.sizeValue);

        const xDist = xPointer - cx;
        const yDist = yPointer - cy;
        const distance = Math.sqrt(xDist * xDist + yDist * yDist);

        if (distance < r + 5) {
          tooltipVisible = true;
          tooltipRef.current.style.opacity = 0.9;
          tooltipRef.current.style.left = `${cx + r + 5}px`;
          tooltipRef.current.style.top = `${cy}px`;
          tooltipRef.current.innerHTML = `
            <strong>Term:</strong> ${d.term}<br/>
            <strong>Study:</strong> ${d.study}<br/>
            <strong>${sizeBy}:</strong>${formatValue(d.sizeValue)}<br/>
            <strong>${colorBy}:</strong> ${formatValue(d.colorValue)}
          `;
        }
      });

      if (!tooltipVisible) {
        tooltipRef.current.style.opacity = 0;
      }
    };

    canvas.addEventListener("mousemove", displayTooltip);
    return () => {
      canvas.removeEventListener("mousemove", displayTooltip);
    };
  }, [plotData, sizeBy, colorBy]);

  return (
    <Box position="relative" margin="0px 0px" height="100%" overflowY="scroll">
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
      />
    </Box>
  );
};

export default DotPlot;
