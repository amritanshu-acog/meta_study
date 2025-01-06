import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  FormControl,
  FormLabel,
  Flex,
  Box,
  Input,
  List,
  ListItem,
  Text,
  useOutsideClick,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
} from "@chakra-ui/react";
import Loader from "../../loader/Loader";

const GeneExpression = ({ formattedData }) => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);
  const searchRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [allGenes, setAllGenes] = useState([]);
  const [selectedGene, setSelectedGene] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [page, setPage] = useState(0); // Track the current page for loading genes
  const [pct1, setPct1] = useState(20);
  const [pct2, setPct2] = useState(20);

  useEffect(() => {
    if (!formattedData || formattedData.length === 0) return;

    const uniqueGeneSet = new Set();

    formattedData.forEach((study) => {
      Object.values(study.celltypes).forEach((celltype) => {
        if (celltype.gene && Array.isArray(celltype.gene)) {
          celltype.gene.forEach((gene) => uniqueGeneSet.add(gene));
        }
      });
    });

    const geneArray = Array.from(uniqueGeneSet);
    setAllGenes(geneArray);

    // Set the first gene as default
    if (geneArray.length > 0) {
      setSelectedGene(geneArray[0]);
    }

    setIsLoading(false);
  }, [formattedData]);

  // Modify the filteredGenes useMemo to implement pagination
  const filteredGenes = useMemo(() => {
    if (!searchQuery && !isInputFocused) return [];

    if (!searchQuery && isInputFocused) {
      // When input is focused but no search query, return the first 20 genes from the current page
      return allGenes.slice(page * 20, (page + 1) * 20);
    }

    // When there's a search query, filter and return matches, also implement pagination
    return allGenes
      .filter((gene) => gene.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 20); // Show top 20 results
  }, [searchQuery, allGenes, isInputFocused, page]);

  // Handle scroll to load more genes
  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom) {
      setPage((prevPage) => prevPage + 1); // Load next page
    }
  };

  // Handle click outside of search component
  useOutsideClick({
    ref: searchRef,
    handler: () => setShowDropdown(false),
  });

  useEffect(() => {
    if (!selectedGene || formattedData.length === 0) return;

    const geneValue =
      typeof selectedGene === "string" ? selectedGene : selectedGene.value;

    const plotData = formattedData.flatMap((study) => {
      return Object.entries(study.celltypes)
        .map(([celltype, data]) => {
          const geneIndex = data.gene.indexOf(geneValue);

          // Apply the pct1 and pct2 filter
          if (geneIndex !== -1) {
            const pct1Value = data.pct_1[geneIndex]; // Assuming pct_1 is an array of percentages
            const pct2Value = data.pct_2[geneIndex]; // Assuming pct_2 is an array of percentages

            // Filter based on the sliders
            if (pct1Value >= pct1 && pct2Value >= pct2) {
              return {
                studyName: study.studyName,
                celltype: celltype,
                geneName: geneValue,
                pvalue: data.pvalue[geneIndex],
                log2FoldChange: data.log2FoldChange[geneIndex],
              };
            }
          }
          return null;
        })
        .filter((d) => d !== null && d.pvalue !== null); // Remove null entries
    });

    // Calculate dynamic dimensions based on data
    const margin = { top: 80, right: 150, bottom: 80, left: 180 };
    const minWidth = 600;
    const minHeight = 400;

    // Calculate space needed per item
    const uniqueCellTypes = Array.from(
      new Set(plotData.map((d) => d.celltype))
    );
    const uniqueStudyNames = Array.from(
      new Set(plotData.map((d) => d.studyName))
    );

    // Minimum space needed per cell type and study
    const minSpacePerCellType = 80; // Space for labels and padding
    const minSpacePerStudy = 40; // Space for labels and padding

    // Calculate required dimensions
    const requiredWidth = Math.max(
      minWidth,
      uniqueCellTypes.length * minSpacePerCellType + margin.left + margin.right
    );
    const requiredHeight = Math.max(
      minHeight,
      uniqueStudyNames.length * minSpacePerStudy + margin.top + margin.bottom
    );

    // Set final dimensions
    const width = requiredWidth - margin.left - margin.right;
    const height = requiredHeight - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Update SVG container size
    svg.attr("width", requiredWidth).attr("height", requiredHeight);

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "10px")
      .style("border-radius", "4px")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const translateX = margin.left + width / 4;
    const translateY = margin.top;

    // Create main SVG group with refined positioning
    const g = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${translateX},${translateY})`);

    // Refined scales
    const maxSizeValue = d3.max(plotData, (d) => d.pvalue);
    const maxColorValue = d3.max(plotData, (d) => Math.abs(d.log2FoldChange));
    const minColorValue = -maxColorValue;

    // Adjust size scale for better visibility
    const sizeScale = d3.scaleLinear().domain([0, maxSizeValue]).range([3, 12]); // Slightly larger circles for better visibility

    const colorScale = d3
      .scaleLinear()
      .domain([minColorValue, 0, maxColorValue])
      .range(["blue", "white", "red"]);

    const xScale = d3
      .scaleBand()
      .domain(uniqueCellTypes)
      .range([0, width / 2])
      .padding(0.2); // Increased padding for better spacing

    const yScale = d3
      .scaleBand()
      .domain(uniqueStudyNames)
      .range([height / 2, 0])
      .padding(0.2); // Increased padding for better spacing

    // Refined X-axis with improved styling
    g.append("g")
      .attr("transform", `translate(0,${height / 2})`)
      .call(d3.axisBottom(xScale).tickSize(5))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif");

    // Refined Y-axis with improved styling
    g.append("g")
      .call(d3.axisLeft(yScale).tickSize(5))
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif");

      g.append("text")
      .attr("x", -margin.left / 2) // Centered horizontally with respect to the Y-axis
      .attr("y", -margin.top / 2) // Slightly above the Y-axis ticks
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "Arial, sans-serif")
      .text("Study Name");
    

    svg
      .append("text")
      .attr("x", translateX + width / 4)
      .attr("y", height / 2 + margin.top + 180)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "Arial, sans-serif")
      .text("Cell Type");

    // Enhanced circles with better interaction
    g.selectAll(".dot")
      .data(plotData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", (d) => xScale(d.celltype) + xScale.bandwidth() / 2)
      .attr("cy", (d) => yScale(d.studyName) + yScale.bandwidth() / 2)
      .attr("r", (d) => sizeScale(d.pvalue))
      .attr("fill", (d) => colorScale(d.log2FoldChange))
      .attr("opacity", 0.8) // Slightly increased opacity
      .attr("stroke", (d) => d3.color(colorScale(d.log2FoldChange)).darker(0.5))
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .attr("stroke-width", 1.5)
          .attr("opacity", 1);

        tooltip.style("opacity", 1).html(`
          <div style="font-family: Arial, sans-serif;">
            <strong>Gene:</strong> ${d.geneName}<br>
            <strong>Study:</strong> ${d.studyName}<br>
            <strong>Cell Type:</strong> ${d.celltype}<br>
            <strong>P-value:</strong> ${d.pvalue.toExponential(2)}<br>
            <strong>Log2 Fold Change:</strong> ${d.log2FoldChange.toFixed(2)}
          </div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.clientX + 10 + "px")
          .style("top", event.clientY + 10 + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.currentTarget)
          .attr("stroke-width", 0.5)
          .attr("opacity", 0.8);
        tooltip.style("opacity", 0);
      });

    // Refined legend with consistent styling
    const legendWidth = 20;
    const legendHeight = height / 2;

    const colorLegendScale = d3
      .scaleLinear()
      .domain([minColorValue, 0, maxColorValue])
      .range([legendHeight, legendHeight / 2, 0]);

    const colorLegendAxis = d3
      .axisRight(colorLegendScale)
      .tickValues([minColorValue, 0, maxColorValue])
      .tickFormat(d3.format(".1f"));

    const colorLegend = g
      .append("g")
      .attr("transform", `translate(${width / 2 + 40}, 0)`);

    // Refined legend title
    colorLegend
      .append("text")
      .attr("x", 0)
      .attr("y", -10)
      .style("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("font-family", "Arial, sans-serif")
      .text("Gene Expression");

    // Enhanced legend axis
    colorLegend
      .append("g")
      .call(colorLegendAxis)
      .selectAll(".tick text")
      .attr("transform", "translate(20, 0)")
      .style("font-size", "12px")
      .style("font-family", "Arial, sans-serif");

    const legendGradient = colorLegend
      .append("defs")
      .append("linearGradient")
      .attr("id", "color-gradient")
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

    // Enhanced legend rectangle
    colorLegend
      .append("rect")
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#color-gradient)")
      .style("stroke", "#ccc")
      .style("stroke-width", 0.5);

    setIsLoading(false);
  }, [selectedGene, formattedData, pct1, pct2]);

  const handleGeneSelect = (gene) => {
    setSelectedGene(gene);
    setSearchQuery(gene);
    setShowDropdown(false);
  };

  // Reset search query and dropdown when input is focused
  const handleFocus = () => {
    setIsInputFocused(true);
    setSearchQuery(""); // Clear input when user clicks on the box
    setShowDropdown(true);
    setPage(0); // Reset to the first page of results
  };

  const handleBlur = () => {
    // Delay setting focus to false to allow click events on the dropdown
    setTimeout(() => setIsInputFocused(false), 200);
  };

  return (
    <Flex
      direction="column"
      align="center"
      w="100%"
      h="100vh"
      maxW="1200px"
      p={4}
    >
      {/* Main Row */}
      <Flex
        p={4}
        bg="#f5f5f5"
        direction="row"
        borderRadius="12px"
        justify="space-around"
        boxShadow="sm"
        wrap="wrap"
        w="60%"
        maxW="100vw"
        mb={4}
      >
        {/* Search Gene Box */}
        <Flex
          bg="#f5f5f5"
          w="35%" // Adjust width to take up 40% of the row
          minW="300px"
          position="relative"
        >
          <FormControl w="100%" ref={searchRef}>
            <FormLabel fontWeight="bold" color="gray.700">
              Search Gene
            </FormLabel>
            <Input
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Type to search genes..."
              bg="white"
            />

            {/* Search Results Dropdown */}
            {showDropdown && (filteredGenes.length > 0 || isInputFocused) && (
              <List
                position="absolute"
                top="100%"
                left={0}
                right={0}
                bg="white"
                mt={1}
                maxH="200px"
                overflowY="auto"
                zIndex={1000}
                onScroll={handleScroll}
              >
                {filteredGenes.length > 0 ? (
                  filteredGenes.map((gene) => (
                    <ListItem
                      key={gene}
                      px={4}
                      py={2}
                      cursor="pointer"
                      _hover={{ bg: "gray.100" }}
                      onClick={() => handleGeneSelect(gene)}
                    >
                      <Text>{gene}</Text>
                    </ListItem>
                  ))
                ) : (
                  <ListItem px={4} py={2}>
                    <Text color="gray.500">No genes found</Text>
                  </ListItem>
                )}
              </List>
            )}

            {/* Currently Selected Gene */}
            {selectedGene && (
              <Text mt={2} fontSize="sm" color="gray.600">
                Current Gene: {selectedGene}
              </Text>
            )}
          </FormControl>
        </Flex>

        {/* Set Percentage Expression Box */}
        <Flex w="30%" minW="250px" direction="column">
          <FormLabel fontWeight="bold" color="gray.700">
            Set Percentage Expression
          </FormLabel>
          <Flex direction="row" align="center" justify="space-between" gap={4}>
            {/* Box for Pct 1 */}
            <Box w="45%">
              <FormControl w="auto">
                <FormLabel color="gray.700">Pct 1</FormLabel>
                <Slider
                  min={0}
                  max={100}
                  value={pct1}
                  onChange={setPct1}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Box mt={2} textAlign="center" fontWeight="bold">
                  {pct1}% {/* Display selected Pct 1 value */}
                </Box>
              </FormControl>
            </Box>

            {/* Box for Pct 2 */}
            <Box w="45%">
              <FormControl w="auto">
                <FormLabel color="gray.700">Pct 2</FormLabel>
                <Slider
                  min={0}
                  max={100}
                  value={pct2}
                  onChange={setPct2}
                  colorScheme="blue"
                >
                  <SliderTrack>
                    <SliderFilledTrack />
                  </SliderTrack>
                  <SliderThumb />
                </Slider>
                <Box mt={2} textAlign="center" fontWeight="bold">
                  {pct2}% {/* Display selected Pct 2 value */}
                </Box>
              </FormControl>
            </Box>
          </Flex>
        </Flex>
      </Flex>

      <Box
        bg="#ffffff"
        p={2}
        w="100%"
        h="100%"
        display="flex"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
        border="1px solid #ddd"
        borderRadius="8px"
      >
        {isLoading ? (
          <Loader /> // Show loader while SVG is loading
        ) : (
          <>
            <svg ref={svgRef} />
            <div ref={tooltipRef} />
          </>
        )}
      </Box>
    </Flex>
  );
};

export default GeneExpression;
