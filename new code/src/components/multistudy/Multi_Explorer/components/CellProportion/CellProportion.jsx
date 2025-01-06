import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Flex, Box, FormControl, FormLabel, Select, Text } from "@chakra-ui/react";
import Loader from "../../loader/Loader";

const CellProportion = ({ data }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [comparison, setComparison] = useState("Before vs After");
  const [cellType, setCellType] = useState("");
  const [isLoading, setIsLoading] = useState(true);


  const cellTypeOptions = ["B Naive", "Memory B Cells"];
  const comparisonOptions = ["Before vs After"];

  useEffect(() => {
    const renderChart = () => {
      if (data.length === 0) return;

      // Calculate dimensions based on number of studies and cell types
      const cellTypes = Array.from(new Set(data.map((d) => d.cellType)));
      const studies = Array.from(new Set(data.map((d) => d.study)));

      // Dynamic sizing calculations
      const minCellSize = 60; // Minimum size for each cell in pixels
      const baseMargin = { top: 60, right: 200, bottom: 80, left: 150 };

      // Calculate required height and width based on data
      const requiredHeight = studies.length * minCellSize;
      const requiredWidth = cellTypes.length * minCellSize;

      // Set margins based on the calculated dimensions
      const margin = {
        top: baseMargin.top,
        right: baseMargin.right,
        bottom: baseMargin.bottom,
        left: Math.max(
          baseMargin.left,
          studies.reduce(
            (max, study) => Math.max(max, study.length * 6),
            baseMargin.left
          )
        ), // Adjust left margin based on study name length
      };

      // Calculate total width and height
      const width =
        Math.max(requiredWidth * 2, 400) - margin.left - margin.right; // Minimum width of 400px
      const height =
        Math.max(requiredHeight * 2, 300) - margin.top - margin.bottom; // Minimum height of 300px

      // Calculate the translation offset to center the plot
      const translateX = margin.left + width / 4;
      const translateY = margin.top;

      d3.select(svgRef.current).selectAll("*").remove();

      const svg = d3
        .select(svgRef.current)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${translateX},${translateY})`);

      const x = d3
        .scaleBand()
        .domain(cellTypes)
        .range([0, width / 2])
        .padding(0.05);

      const y = d3
        .scaleBand()
        .domain(studies)
        .range([0, height / 2])
        .padding(0.05);

      svg
        .append("rect")
        .attr("width", width / 2)
        .attr("height", height / 2)
        .attr("fill", "none");

      // Adjust axes positions with dynamic sizing
      svg
        .append("g")
        .call(d3.axisBottom(x).tickSize(5))
        .attr("transform", `translate(0,${height / 2})`)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "12px");

      svg
        .append("g")
        .call(d3.axisLeft(y).tickSize(5))
        .selectAll("text")
        .style("font-size", "12px");

      // Adjust axis labels for dynamic size
      svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 4)
        .attr("y", -margin.left * 0.8)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Study Name")
        .style("font-size", "16px");

      svg
        .append("text")
        .attr("x", width / 4)
        .attr("y", height / 2 + margin.bottom * 0.8 + 20)
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Cell Type")
        .style("font-size", "16px");

      const mid = 0;
      const colorScale = d3
        .scaleLinear()
        .domain([-1.5, mid, 1.5])
        .range(["blue", "lightgrey", "red"]);

      // Adjust size scale based on plot dimensions
      const maxRadius = Math.min(x.bandwidth(), y.bandwidth()) / 3;
      const sizeScale = d3
        .scaleSqrt()
        .domain([0, d3.max(data, (d) => d.size)])
        .range([2, maxRadius]);

      // Adjust legend position and size based on plot dimensions
      const legendWidth = 20;
      const legendHeight = height / 2;

      const colorLegendScale = d3
        .scaleLinear()
        .domain([-1.5, 0, 1.5])
        .range([legendHeight, legendHeight / 2, 0]);

      const colorLegendAxis = d3
        .axisRight(colorLegendScale)
        .tickValues([-1.5, 0, 1.5]);

      // Position legend with dynamic spacing
      const legendSpacing = Math.min(60, width * 0.1); // Responsive spacing
      const colorLegend = svg
        .append("g")
        .attr("transform", `translate(${width / 2 + legendSpacing}, 0)`);

      colorLegend
        .append("text")
        .attr("x", 0)
        .attr("y", -10)
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .text("Cell Proportion");

      const legendGradient = colorLegend
        .append("defs")
        .append("linearGradient")
        .attr("id", "color-gradient-cellproportion")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      legendGradient
        .selectAll("stop")
        .data([
          { offset: "0%", color: "blue" },
          { offset: "50%", color: "white" },
          { offset: "100%", color: "red" },
        ])
        .enter()
        .append("stop")
        .attr("offset", (d) => d.offset)
        .attr("stop-color", (d) => d.color);

      colorLegend
        .append("rect")
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .style("fill", "url(#color-gradient-cellproportion)");

      colorLegend
        .append("g")
        .call(colorLegendAxis)
        .attr("transform", "translate(15, 0)")
        .select(".domain")
        .remove();

      const tooltip = d3
        .select(tooltipRef.current)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "1px solid #ccc")
        .style("padding", "5px")
        .style("border-radius", "4px")
        .style("opacity", 0);

      // Update circle positions with dynamic sizing
      svg
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", (d) => x(d.cellType) + x.bandwidth() / 2)
        .attr("cy", (d) => y(d.study) + y.bandwidth() / 2)
        .attr("r", (d) => sizeScale(d.size))
        .style("fill", (d) => colorScale(d.colorValue))
        .on("mouseover", (event, d) => {
          tooltip.style("opacity", 1).html(`
              <strong>Study:</strong> ${d.study}<br/>
              <strong>Cell Type:</strong> ${d.cellType}<br/>
              <strong>Size By:</strong> ${d.size.toFixed(4)}<br/>
              <strong>Color By:</strong> ${d.colorValue.toFixed(4)}
            `);
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 10 + "px");
        })
        .on("mouseout", () => {
          tooltip.style("opacity", 0);
        });

      setIsLoading(false);
    };

    renderChart();

    const handleResize = () => {
      renderChart();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [data, isLoading]);

  return (
    <Flex direction="column" align="center" w="100%" h="100vh" p={4}>
      {isLoading ? (
        <Loader /> // Show the loader while loading
      ) : (
        <>

        <Box><Text fontSize="lg" fontWeight="medium">Cell Proportion Dot Plot.</Text></Box>

          <Box
            bg="#ffffff"
            p={2}
            w="100%"
            maxW="1200px"
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexDirection="column"
            border="1px solid #ddd" // Add a border with a light gray color
            borderRadius="8px" // Set border radius for rounded corners
          >
            <svg ref={svgRef} />
            <div ref={tooltipRef} />
          </Box>
        </>
      )}
    </Flex>
  );
};

export default CellProportion;
