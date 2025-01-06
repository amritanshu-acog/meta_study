import React, { useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import * as d3 from "d3";

const BarPlot = ({ plotData, xAxisData, sizeBy, colorBy }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    // Calculate the longest term width dynamically
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

    const labelPadding = 20;
    const dynamicLeftMargin = textWidth + labelPadding;

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

    const margin = {
      top: 30,
      right: 140,
      bottom: 80,
      left: dynamicLeftMargin, // Use dynamic margin based on term length
    };

    const blockHeight = 30;
    const height = data.length * blockHeight + margin.top + margin.bottom;
    const width = 1250 - margin.left - margin.right;

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

    const maxColorValue = d3.max(data, (d) => d.colorValue);
    const minColorValue = d3.min(data, (d) => d.colorValue);

    const colorScale = d3
      .scaleLinear()
      .domain([minColorValue, maxColorValue])
      .range(["red", "blue"]);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height);

    // Add the x-axis with numbers
    svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x))
      .style("font-size", "12px");

    // Add bars for terms
    svg
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", margin.left)
      .attr("y", (d) => y(d.term))
      .attr("height", y.bandwidth())
      .attr("width", (d) => x(d.xAxisValue) - margin.left)
      .attr("fill", (d) => colorScale(d.colorValue))
      .on("mouseenter", function (event, d) {
        const barX = x(d.xAxisValue);
        const barY = y(d.term) + y.bandwidth() / 2;

        d3
          .select(tooltipRef.current)
          .style("opacity", 0.9)
          .style("left", `${barX + 10}px`)
          .style("top", `${barY}px`).html(`
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
          `);
      })
      .on("mouseleave", () => {
        d3.select(tooltipRef.current).style("opacity", 0);
      });

    // Add y-axis labels
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

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", margin.left - 100)
      .attr("y", margin.top)
      .text("Terms");

    // Add gradient color bar
    const gradient = svg
      .append("defs")
      .append("linearGradient")
      .attr("id", "colorGradientBar")
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
      .style("fill", "url(#colorGradientBar)");

    svg
      .append("text")
      .attr("x", width + margin.left + 30)
      .attr("y", margin.top - 10)
      .attr("text-anchor", "middle")
      .text(colorBy);

    // Add numbers to the color gradient
    const colorAxisScale = d3
      .scaleLinear()
      .domain([maxColorValue, minColorValue])
      .range([margin.top, height - margin.bottom]);

    svg
      .append("g")
      .attr("transform", `translate(${width + margin.left + 45},0)`)
      .call(d3.axisRight(colorAxisScale).ticks(5))
      .style("font-size", "10px");
  }, [plotData, xAxisData, sizeBy, colorBy]);

  return (
    <Box position="relative" margin="50px 0">
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

export default BarPlot;
