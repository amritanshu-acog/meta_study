import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import {
  IconButton,
  HStack,
  Box,
  VStack,
  Button,
  Text,
  Heading,
} from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import { FaUndoAlt, FaHighlighter } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import EnrichmentAnalysisPage from "./enrichment-analysis/EnrichmentAnalysisPage";
import TableComponent from "./TableComponent";

const DgeAnalysisMain = ({
  alldata,
  data,
  significanceThreshold,
  foldChangeThreshold,
  geneSelection,
  upregulatedData,
  downregulatedData,
  upregulatedCount,
  downregulatedCount,
}) => {
  const geneList = data.gene;
  const searchGeneOptions = geneList.map((gene) => {
    return { value: gene, label: gene };
  });

  const legendColors = {
    upRegulated: "rgba(255, 0, 0, 0.6)",
    downRegulated: "rgba(0, 0, 255, 0.6)",
    nonSignificant: "rgba(102,102,102,0.4)",
    highlighted: "indigo", // Added for highlighted genes
    overlayed: "yellow",
  };

  const [showEnrichmentAnalysis, setShowEnrichmentAnalysis] = useState(false); // State to control visibility of EnrichmentAnalysisPage
  const [enrichmentInput, setEnrichmentInput] = useState(null); // State to hold the enrichment data

  const [selectedGenes, setSelectedGenes] = useState([]);
  const [selectedGeneOptions, setSelectedGeneOptions] = useState([]);
  const [visibility, setVisibility] = useState({
    upRegulated: true,
    downRegulated: true,
    nonSignificant: true,
    highlighted: true, // Added to keep track of highlighted gene visibility
    overlayed: true,
  });

  const canvasRef = useRef();
  const overlayRef = useRef();
  const tooltipRef = useRef();
  const zoomRef = useRef(d3.zoomIdentity); // To preserve zoom state
  const width = 800;
  const height = 450;

  const GeneCellRenderer = (props) => {
    return (
      <HStack>
        <IconButton
          icon={<FaHighlighter />}
          aria-label={`Highlight ${props.value}`}
          size="xs"
          title={`Highlight ${props.value}`}
          onClick={() => handleHighlightGene(props.value)}
        />
        <a
          href={`https://maayanlab.cloud/Harmonizome/gene/${props.value}`}
          target="_blank" // Ensures link opens in new tab
          rel="noopener noreferrer" // Security best practices when opening new tabs
          style={{
            color: "blue", // Standard link color
            textDecoration: "underline", // Underline to make it look more like a link
            cursor: "pointer", // Pointer cursor to indicate it's clickable
          }}
        >
          {props.value}
        </a>
      </HStack>
    );
  };

  const transformedData = data.gene.map((gene, index) => {
    return {
      gene: gene,
      log2FoldChange: data.log2FoldChange[index],
      pvalue: data.pvalue[index],
      padj: data.padj[index],
      negativeLog10PValue: data.negativeLog10PValue[index],
      type: data.type[index],
      studyName: data.studyName[index],
    };
  });

  const studyName = data.studyName[0];

  // Separate upregulated and downregulated genes (No useMemo)
  const upregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange >= foldChangeThreshold &&
      d.negativeLog10PValue !== null &&
      d.negativeLog10PValue >= significanceThreshold
  );

  const downregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange <= -foldChangeThreshold &&
      d.negativeLog10PValue !== null &&
      d.negativeLog10PValue >= significanceThreshold
  );

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const xExtent = d3.extent(transformedData, (d) => d.log2FoldChange);
    const yExtent = d3.extent(transformedData, (d) => -Math.log10(d.pvalue));
    const xPadding = (xExtent[1] - xExtent[0]) * 0.05;
    const yPadding = (yExtent[1] - yExtent[0]) * 0;

    const xScaleInitial = d3
      .scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([margin.left, width - margin.right]);

    const yScaleInitial = d3
      .scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Apply preserved zoom transform
    let xScale = zoomRef.current.rescaleX(xScaleInitial);
    let yScale = zoomRef.current.rescaleY(yScaleInitial);

    const svg = d3.select(overlayRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute")
      .style("top", 0)
      .style("left", 0)
      .style("cursor", "move")
      .style("border", "1px solid #808080");

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8));

    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(8));

    // X and Y axis Labels
    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height - 10)
      .style("font", "800 14px System-UI, sans-serif")
      .style("fill", "#666")
      .text("log₂ Fold Change");

    svg
      .append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", 20)
      .style("font", "800 14px System-UI, sans-serif")
      .style("fill", "#666")
      .text("-log₁₀ p-value");

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    const drawCanvas = () => {
      context.clearRect(0, 0, width, height);

      transformedData.forEach((d) => {
        const xPos = xScale(d.log2FoldChange);
        const yPos = yScale(-Math.log10(d.pvalue));
        const isInRange =
          xPos >= margin.left &&
          xPos <= width - margin.right &&
          yPos >= margin.top &&
          yPos <= height - margin.bottom;

        if (isInRange) {
          let fillStyle = legendColors.nonSignificant; // Default to non-significant color
          let visible = visibility.nonSignificant; // Default visibility
          let borderColor = null;

          // Non-significant logic
          const isSignificant =
            -Math.log10(d.pvalue) >= significanceThreshold &&
            (d.log2FoldChange >= foldChangeThreshold ||
              d.log2FoldChange <= -foldChangeThreshold);

          // Handle "base" type
          if (d.type === "base" && isSignificant) {
            if (d.log2FoldChange <= -foldChangeThreshold) {
              fillStyle = legendColors.downRegulated; // Blue for downregulated
              visible = visibility.downRegulated;
            } else if (d.log2FoldChange >= foldChangeThreshold) {
              fillStyle = legendColors.upRegulated; // Red for upregulated
              visible = visibility.upRegulated;
            }
          }
          // Handle overlap types (must, not, both)
          else if (
            ["overlap-must", "overlap-not", "overlap-both"].includes(d.type)
          ) {
            if (isSignificant) {
              fillStyle = "yellow"; // Yellow for overlap
              visible = visibility.overlayed;

              // Add border logic based on fold change threshold
              if (d.log2FoldChange >= foldChangeThreshold) {
                borderColor = "red"; // Red border for upregulated
              } else if (d.log2FoldChange <= -foldChangeThreshold) {
                borderColor = "blue"; // Blue border for downregulated
              }
            } else {
              fillStyle = legendColors.nonSignificant; // Non-significant color
              visible = visibility.nonSignificant;
            }
          }

          // Highlight logic for selected genes (no gene selection logic now)
          const isHighlighted = selectedGenes.includes(d.gene);

          if (
            (visible && !isHighlighted) ||
            (isHighlighted && visibility.highlighted)
          ) {
            context.beginPath();
            context.fillStyle = fillStyle;

            const radius = isHighlighted ? 5 : 3;
            context.arc(xPos, yPos, radius, 0, 2 * Math.PI);
            context.fill();

            // Add border logic for overlap genes
            if (borderColor) {
              context.beginPath();
              context.strokeStyle = borderColor;
              context.lineWidth = 1.5;
              context.arc(xPos, yPos, radius + 1, 0, 2 * Math.PI);
              context.stroke();
            }

            // Draw a black border around highlighted points
            if (isHighlighted) {
              context.lineWidth = 4;
              context.strokeStyle = legendColors.highlighted;
              context.stroke();

              // Render gene name next to the highlighted dot
              context.fillStyle = "black";
              context.font = "12px Arial";
              context.fillText(d.gene, xPos + 8, yPos + 4);
            }
          }
        }
      });

      // Reset context state for threshold lines
      context.lineWidth = 1;
      context.setLineDash([5, 3]);
      context.strokeStyle = "gray";

      const ySignificanceThreshold = yScale(significanceThreshold);
      if (
        ySignificanceThreshold >= margin.top &&
        ySignificanceThreshold <= height - margin.bottom
      ) {
        context.beginPath();
        context.moveTo(margin.left, ySignificanceThreshold);
        context.lineTo(width - margin.right, ySignificanceThreshold);
        context.stroke();
      }

      const xPositiveThreshold = xScale(foldChangeThreshold);
      if (
        xPositiveThreshold >= margin.left &&
        xPositiveThreshold <= width - margin.right
      ) {
        context.beginPath();
        context.moveTo(xPositiveThreshold, margin.top);
        context.lineTo(xPositiveThreshold, height - margin.bottom);
        context.stroke();
      }

      const xNegativeThreshold = xScale(-foldChangeThreshold);
      if (
        xNegativeThreshold >= margin.left &&
        xNegativeThreshold <= width - margin.right
      ) {
        context.beginPath();
        context.moveTo(xNegativeThreshold, margin.top);
        context.lineTo(xNegativeThreshold, height - margin.bottom);
        context.stroke();
      }

      context.setLineDash([]);
    };

    drawCanvas();

    const overlay = d3.select(overlayRef.current);
    overlay.style("pointer-events", "all");

    const displayTooltip = (event) => {
      const pointer = d3.pointer(event, overlay.node());
      const x0 = xScale.invert(pointer[0]);
      const y0 = yScale.invert(pointer[1]);
      let closestPoint;
      let minDistance = Infinity;

      transformedData.forEach((d) => {
        const xDist = x0 - d.log2FoldChange;
        const yDist = y0 + Math.log10(d.pvalue);
        const distance = Math.sqrt(xDist * xDist + yDist * yDist);

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = d;
        }
      });

      if (closestPoint) {
        const x = xScale(closestPoint.log2FoldChange);
        const y = yScale(-Math.log10(closestPoint.pvalue));
        const thresholdDistance = 0.1;

        if (
          x >= margin.left &&
          x <= width - margin.right &&
          y >= margin.top &&
          y <= height - margin.bottom &&
          minDistance < thresholdDistance
        ) {
          d3.select(overlayRef.current).style("cursor", "default");
          d3.select(tooltipRef.current)
            .style("opacity", 0.9)
            .style("left", `${pointer[0] + 15}px`)
            .style("top", `${pointer[1] - 35}px`)
            .html(
              `<strong>Gene:</strong> ${
                closestPoint.gene
              }<br/><strong>Log2 Fold Change:</strong> ${closestPoint.log2FoldChange.toFixed(
                3
              )}<br/><strong>PValue:</strong> ${
                closestPoint.pvalue
              }<br/><strong>StudyName:</strong>${closestPoint.studyName}`
            );
        } else {
          d3.select(tooltipRef.current).style("opacity", 0);
          d3.select(overlayRef.current).style("cursor", "move");
        }
      }
    };

    const zoom = d3
      .zoom()
      .scaleExtent([1, 1000])
      .translateExtent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on("zoom", (event) => {
        zoomRef.current = event.transform; // Update zoomRef with the current transform
        xScale = event.transform.rescaleX(xScaleInitial);
        yScale = event.transform.rescaleY(yScaleInitial);

        xAxisGroup.call(d3.axisBottom(xScale).ticks(8));
        yAxisGroup.call(d3.axisLeft(yScale).ticks(8));

        drawCanvas();
      });

    svg.call(zoom).call(zoom.transform, zoomRef.current);

    overlay
      .on("mousemove", displayTooltip)
      .on("mouseout", () => d3.select(tooltipRef.current).style("opacity", 0));

    const resetZoom = () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      zoomRef.current = d3.zoomIdentity; // Reset zoomRef when resetting zoom
    };

    d3.select(".reset-zoom").on("click", resetZoom);
  }, [
    data,
    selectedGenes,
    foldChangeThreshold,
    significanceThreshold,
    visibility,
    geneSelection,
  ]);

  const filterGenes = (inputValue) => {
    return searchGeneOptions.filter((gene) =>
      gene.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(filterGenes(inputValue));
    }, 1000);
  };

  // Handle gene selection
  const handleGeneSelect = (selectedOptions) => {
    setSelectedGenes(
      selectedOptions ? selectedOptions.map((option) => option.value) : []
    );
    setSelectedGeneOptions(selectedOptions || []);
  };

  const handleLegendClick = (key) => {
    setVisibility((prevVisibility) => ({
      ...prevVisibility,
      [key]: !prevVisibility[key],
    }));
  };

  // Handle redirect icon click to highlight gene and update search
  const handleHighlightGene = (gene) => {
    const newSelectedGenes = new Set(selectedGenes);
    newSelectedGenes.add(gene);

    setSelectedGenes(Array.from(newSelectedGenes));
    setSelectedGeneOptions((prevOptions) => [
      ...prevOptions,
      { value: gene, label: gene },
    ]);
  };

  const pushDataToEnrichment = () => {
    // Prepare the result data without filtering invalid genes
    const result = {
      upregulated: upregulatedData,
      downregulated: downregulatedData,
    };

    // Set the enrichment input data to state
    setEnrichmentInput(result);
    // Show the EnrichmentAnalysisPage by updating the visibility state
    setShowEnrichmentAnalysis(true);
  };

  return (
    <Box width="82.5vw">
      <HStack
        alignItems="center"
        justifyContent="space-between" // Add space between the elements
        paddingBottom="20px"
        borderTop="1px solid #ddd"
        width="100%" // Ensure it takes up full width
      >
        <Box m="5px" width="100%">
          <Box textAlign="center" width="100%" mb="10px">
            <Text fontSize="20px" fontWeight="bold" color="gray.700">
              Volcano Plot for: {studyName}.
            </Text>
          </Box>
          <AsyncSelect
            isMulti
            cacheOptions
            loadOptions={loadOptions}
            value={selectedGeneOptions}
            placeholder="Search for genes..."
            isClearable
            onChange={handleGeneSelect}
            noOptionsMessage={() => "Start typing..."}
            styles={{
              control: (provided) => ({
                ...provided,
                width: "300px", // Ensure it takes full width of the container
                minWidth: "300px",
              }),
              menu: (provided) => ({
                ...provided,
                width: "300px", // Align dropdown width with control
                minWidth: "300px",
                zIndex: 9999,
                marginTop: "2px",
              }),
            }}
          />
        </Box>

        {/* Center text */}
      </HStack>

      <div
        style={{
          position: "relative",
          width: "900px",
          height: "450px",
          margin: "20px auto",
        }}
      >
        <HStack
          spacing={2}
          position="absolute"
          top="10px"
          right="10px"
          zIndex={1}
          bg="white"
          p={2}
          borderRadius="md"
          boxShadow="md"
          mb={2}
        >
          <IconButton
            icon={<FaUndoAlt />}
            aria-label="Reset Zoom"
            colorScheme="blue"
            size="xs"
            className="reset-zoom"
          />
        </HStack>
        <VStack
          spacing={2}
          position="absolute"
          top="60px"
          right="-105px"
          zIndex={1}
          bg="white"
          p={2}
          borderRadius="md"
          boxShadow="md"
          mb={2}
          alignItems="start"
        >
          {Object.keys(legendColors).map((key) => (
            <HStack
              key={key}
              spacing={2}
              cursor="pointer"
              onClick={() => handleLegendClick(key)}
              opacity={visibility[key] ? 1 : 0.3}
            >
              <Box
                width="12px"
                height="12px"
                backgroundColor={legendColors[key]}
              />
              <div style={{ userSelect: "none" }}>
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </div>
            </HStack>
          ))}
        </VStack>

        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{ position: "absolute", left: 0, top: 0, cursor: "move" }}
        ></canvas>
        <svg ref={overlayRef}></svg>
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
          }}
        ></div>
      </div>

      {/* Tables Section */}
      <HStack
        spacing={8}
        mt={12}
        justifyContent="center"
        alignItems="start"
        padding="0 20px"
        paddingBottom="50px"
      >
        <VStack width="50%">
          <Box
            mb={4}
            textAlign="left"
            fontSize="20px"
            fontWeight="bold"
            color="rgba(0, 0, 255, 0.85)"
          >
            Down Regulated Genes: {downregulatedCount}
          </Box>
          {/* Render TableComponent for downregulated data */}
          <TableComponent data={downregulatedData} />
        </VStack>
        <VStack width="50%">
          <Box
            mb={4}
            textAlign="left"
            fontSize="20px"
            fontWeight="bold"
            color="rgba(255, 0, 0, 0.85)"
          >
            Up Regulated Genes: {upregulatedCount}
          </Box>
          {/* Render TableComponent for upregulated data */}
          <TableComponent data={upregulatedData} />
        </VStack>
      </HStack>

      <Box mt={2} mb="30px" display="flex" justifyContent="center" overflow="hidden">
        {/* Conditionally render button based on the availability of genes */}
        {upregulatedGenes.length > 0 || downregulatedGenes.length > 0 ? (
          <Button onClick={pushDataToEnrichment}>
            Perform Enrichment Analysis
          </Button>
        ) : null}
      </Box>

      {/* Conditionally render EnrichmentAnalysisPage based on state */}
      {showEnrichmentAnalysis && enrichmentInput && (
        <EnrichmentAnalysisPage enrichmentInput={enrichmentInput} />
      )}
    </Box>
  );
};

export default DgeAnalysisMain;
