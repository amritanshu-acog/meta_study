import React, { useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";

const DotPlot = ({ plotData, xAxisData, sizeBy, colorBy }) => {
  const containerRef = useRef();
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [containerWidth, setContainerWidth] = useState(0);

  // useEffect(() => {
  //   console.log("Plot Data:", plotData); // Check entire structure
  //   // Check specific properties
  //   if (plotData) {
  //     console.log("Term Array:", plotData.Term);
  //   }
  // }, [plotData]);

  useEffect(() => {
    const longestTerm = plotData.Term.reduce(
      (a, b) => (a.length > b.length ? a : b),
      ""
    );

    // Create a temporary SVG text element to measure text width
    const tempText = d3
      .select("body")
      .append("svg")
      .attr("class", "temp-svg")
      .append("text")
      .attr("class", "temp-text")
      .style("font-size", "13px")
      .text(longestTerm);

    const textWidth = tempText.node().getComputedTextLength();

    // Remove the temporary text element
    d3.select(".temp-svg").remove();

    // Define your margins and compute container width
    const labelPadding = 20;
    const margin = {
      top: 30,
      right: 140,
      bottom: 80,
      left: textWidth + labelPadding,
    };
    const fixedWidth = 1200 - margin.left - margin.right;
    const dynamicWidth = plotData.Term.length * 8; // Example dynamic width allocation per term
    const plotWidth = Math.max(fixedWidth, dynamicWidth);
    setContainerWidth(plotWidth + margin.left + margin.right);
  }, [plotData]);

  useEffect(() => {
    if (containerWidth === 0) return;

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

    const labelFontSize = 13;
    const labelPadding = 20;
    const longestTerm = plotData.Term.reduce(
      (a, b) => (a.length > b.length ? a : b),
      ""
    );
    const margin = {
      top: 30,
      right: 140,
      bottom: 80,
      left: longestTerm.length * (labelFontSize * 0.6) + labelPadding, // Dynamic left margin
    };
    const blockHeight = 30;
    const height = data.length * blockHeight + margin.top + margin.bottom;
    const width = containerWidth - margin.left - margin.right;

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

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height);

    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call((g) => g.select(".domain").remove())
      .style("font-size", "12px");

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

    // x axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2 + margin.left)
      .attr("y", height - margin.bottom + 40)
      .text(xAxisData);

    // y axis label
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", margin.left - 100)
      .attr("y", margin.top)
      .text("Terms");

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

    const colorAxisScale = d3
      .scaleLinear()
      .domain([maxColorValue, minColorValue])
      .range([margin.top, height - margin.bottom]);

    svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 45},0)`)
      .call(d3.axisRight(colorAxisScale).ticks(5))
      .style("font-size", "10px");

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.xAxisValue))
      .attr("cy", (d) => y(d.term) + y.bandwidth() / 2)
      .attr("r", (d) => sizeScale(d.sizeValue))
      .attr("fill", (d) => colorScale(d.colorValue))
      .on("mousemove", (event, d) => {
        const [xPos, yPos] = d3.pointer(event);
        tooltipRef.current.style.opacity = 0.9;
        tooltipRef.current.style.left = `${xPos + 15}px`;
        tooltipRef.current.style.top = `${yPos}px`;
        tooltipRef.current.innerHTML = `
          <strong>Term:</strong> ${d.term}<br/>
          <strong>Overlap:</strong> ${d.overlap}<br/>
          <strong>Overlap Percent:</strong> ${d.overlapPercent}%<br/>
          <strong>-log10P-value:</strong> ${
            -Math.log10(d.pValue) < 1 && -Math.log10(d.pValue) > -1
              ? -Math.log10(d.pValue).toExponential(2)
              : -Math.log10(d.pValue).toFixed(2)
          }<br/>
          <strong>-log10Adjusted P-value:</strong> ${
            -Math.log10(d.adjustedPValue) < 1 &&
            -Math.log10(d.adjustedPValue) > -1
              ? -Math.log10(d.adjustedPValue).toExponential(2)
              : -Math.log10(d.adjustedPValue).toFixed(2)
          }<br/>
          <strong>Odds Ratio:</strong> ${d.oddsRatio.toFixed(2)}<br/>
          <strong>Combined Score:</strong> ${d.combinedScore.toFixed(2)}
        `;
      })
      .on("mouseleave", () => {
        tooltipRef.current.style.opacity = 0;
      });
  }, [plotData, xAxisData, sizeBy, colorBy, containerWidth]);

  return (
    <Box
      ref={containerRef}
      position="relative"
      margin="50px 0"
      height="100%"
      width={`${containerWidth}px`}
      overflowY="scroll"
    >
      <svg
        ref={svgRef}
        style={{ position: "absolute", top: 0, left: 0, zIndex: 0 }}
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
