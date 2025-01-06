import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  IconButton,
  HStack,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import AsyncSelect from "react-select/async";
import {
  FaUndoAlt,
  FaHighlighter,
  FaDownload,
  FaUpload,
  FaSearchPlus,
} from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import html2canvas from "html2canvas-pro";

const DgeAnalysisMain = ({
  includeTable = true,
  data,
  setActiveComponent,
  initialFoldChangeThreshold,
  initialSignificanceThreshold = 1.3,
  usedFilters,
}) => {
  // console.log(data);
  const geneList = data.gene;
  const searchGeneOptions = geneList.map((gene) => {
    return { value: gene, label: gene };
  });

  const legendColors = {
    upRegulated: "rgba(255, 0, 0, 0.6)",
    downRegulated: "rgba(0, 0, 255, 0.6)",
    nonSignificant: "rgba(102,102,102,0.4)",
    highlighted: "rgb(255,255,7)", // Added for highlighted genes
  };
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [selectedGenes, setSelectedGenes] = useState([]);
  const [selectedGeneOptions, setSelectedGeneOptions] = useState([]);
  const [significanceThreshold, setSignificanceThreshold] = useState(
    initialSignificanceThreshold
  );
  const [visibility, setVisibility] = useState({
    upRegulated: true,
    downRegulated: true,
    nonSignificant: true,
    highlighted: true, // Added to keep track of highlighted gene visibility
  });

  const canvasRef = useRef();
  const overlayRef = useRef();
  const tooltipRef = useRef();
  const zoomRef = useRef(d3.zoomIdentity); // To preserve zoom state
  const width = 800;
  const height = 450;

  // Determine min and max for sliders based on data
  const minPValue = Math.min(...data.pvalue.map((p) => -Math.log10(p)));
  const maxPValue = Math.max(
    ...data.pvalue.map((p) => Math.ceil(-Math.log10(p)))
  );
  const minLog2FoldChange = 0; // Set minimum to 0 for logical reasons
  const maxLog2FoldChange = Math.max(...data.log2FoldChange);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(
    initialFoldChangeThreshold !== undefined
      ? initialFoldChangeThreshold
      : (minLog2FoldChange + maxLog2FoldChange) / 2
  );

  // Transform data for tables
  const transformedData = data.gene.map((gene, index) => ({
    gene: gene,
    baseMean: data.baseMean[index],
    log2FoldChange: data.log2FoldChange[index],
    pvalue: data.pvalue[index],
    padj: data.padj[index],
    negativeLog10PValue: -Math.log10(data.pvalue[index]),
  }));

  // Separate upregulated and downregulated genes for tables (not affected by visibility state)
  const upregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange >= foldChangeThreshold &&
      -Math.log10(d.pvalue) >= significanceThreshold
  );
  const downregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange <= -foldChangeThreshold &&
      -Math.log10(d.pvalue) >= significanceThreshold
  );

  // Custom renderer for clickable Genes (index)
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
            color: "#3182ce", // Standard link color
            textDecoration: "underline", // Underline to make it look more like a link
            cursor: "pointer", // Pointer cursor to indicate it's clickable
          }}
        >
          {props.value}
        </a>
      </HStack>
    );
  };

  const columnDefs = [
    {
      headerName: "Gene",
      field: "gene",
      sortable: true,
      filter: "agTextColumnFilter",
      cellRenderer: GeneCellRenderer,
      headerClass: "header-red",
      width: 200,
    },
    {
      headerName: "log₂ FC",
      field: "log2FoldChange",
      sortable: true,
      filter: "agTextColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "p-value",
      field: "pvalue",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "-log₁₀ p-value",
      field: "negativeLog10PValue",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      headerName: "P Adjusted",
      field: "padj",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
  ];

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
      .style("cursor", "move");

    // Custom tick format function for the x-axis
    const formatLog2Tick = (value) => {
      if (value === 0) {
        return "0"; // Return '0' for zero values
      }
      return Math.abs(value) < 1 ? value.toExponential(2) : value.toFixed(2);
    };

    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(8).tickFormat(formatLog2Tick));

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
          let fillStyle = legendColors.nonSignificant;
          let visible = visibility.nonSignificant;

          if (-Math.log10(d.pvalue) >= significanceThreshold) {
            if (d.log2FoldChange <= -foldChangeThreshold) {
              fillStyle = legendColors.downRegulated;
              visible = visibility.downRegulated;
            } else if (d.log2FoldChange >= foldChangeThreshold) {
              fillStyle = legendColors.upRegulated;
              visible = visibility.upRegulated;
            }
          }

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

            if (isHighlighted) {
              context.lineWidth = 4;
              context.strokeStyle = legendColors.highlighted;
              context.stroke();

              // Render text above the highlighted points
              context.font = "10px sans-serif";
              context.fillStyle = "black"; // Text color
              context.fillText(d.gene, xPos + 5, yPos - 10); // Adjust the position for visibility
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
      let closestPoint = null;
      let minDistance = Infinity;
      const radius = 3; // match with context.arc radius for comparison
      const thresholdDistance = radius + 5; // Set threshold slightly larger than point radius

      transformedData.forEach((d) => {
        const xPos = xScale(d.log2FoldChange);
        const yPos = yScale(-Math.log10(d.pvalue));
        const xDist = pointer[0] - xPos;
        const yDist = pointer[1] - yPos;
        const distance = Math.sqrt(xDist * xDist + yDist * yDist);

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint = { d, xPos, yPos };
        }
      });

      if (closestPoint && minDistance < thresholdDistance) {
        d3.select(overlayRef.current).style("cursor", "default");
        d3.select(tooltipRef.current)
          .style("opacity", 0.9)
          .style("left", `${closestPoint.xPos + 15}px`)
          .style("top", `${closestPoint.yPos - 35}px`)
          .html(
            `<strong>Gene:</strong> ${
              closestPoint.d.gene
            }<br/><strong>Log2 Fold Change:</strong> ${
              Math.abs(closestPoint.d.log2FoldChange) < 1
                ? closestPoint.d.log2FoldChange.toExponential(2)
                : closestPoint.d.log2FoldChange.toFixed(3)
            }<br/><strong>pValue:</strong> ${
              closestPoint.d.pvalue < 1 && closestPoint.d.pvalue > -1
                ? closestPoint.d.pvalue.toExponential(2)
                : closestPoint.d.pvalue.toFixed(3)
            }`
          );
      } else {
        d3.select(tooltipRef.current).style("opacity", 0);
        d3.select(overlayRef.current).style("cursor", "move");
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
        if (zoomEnabled) {
          // Check if zoom is enabled
          zoomRef.current = event.transform;
          xScale = event.transform.rescaleX(xScaleInitial);
          yScale = event.transform.rescaleY(yScaleInitial);

          xAxisGroup.call(
            d3.axisBottom(xScale).ticks(8).tickFormat(formatLog2Tick)
          );
          yAxisGroup.call(d3.axisLeft(yScale).ticks(8));

          drawCanvas();
        }
      });

    svg.call(zoom).call(zoom.transform, zoomRef.current);

    overlay
      .on("mousemove", displayTooltip)
      .on("mouseout", () => d3.select(tooltipRef.current).style("opacity", 0));

    const resetZoom = () => {
      svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
      zoomRef.current = d3.zoomIdentity; // Reset zoomRef when resetting zoom
      setZoomEnabled(false);
    };

    d3.select(".reset-zoom").on("click", resetZoom);

    return () => {
      svg.on(".zoom", null); // Clean up zoom behavior
    };
  }, [
    zoomEnabled,
    data,
    selectedGenes,
    foldChangeThreshold,
    significanceThreshold,
    visibility,
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
    // Ensure selectedGenes is a unique list
    const newSelectedGenes = new Set(selectedGenes);
    newSelectedGenes.add(gene);

    // Convert the Set back to an array
    setSelectedGenes(Array.from(newSelectedGenes));

    // Check if the gene option is already present based on the 'value' property
    if (!selectedGeneOptions.some((option) => option.value === gene)) {
      // Add the gene option only if it does not exist
      setSelectedGeneOptions((prevOptions) => [
        ...prevOptions,
        { value: gene, label: gene },
      ]);
    }
  };

  const pushDataToEnrichment = () => {
    const result = {
      source: "dge",
      metaData: {
        usedFilters: usedFilters,
        significanceThreshold: significanceThreshold,
        foldChangeThreshold: foldChangeThreshold,
      },
      upregulated: upregulatedGenes,
      downregulated: downregulatedGenes,
    };
    // console.log(result);
    // Store result in local Storage
    try {
      sessionStorage.setItem("enrichmentInput", JSON.stringify(result));
    } catch (error) {
      console.error("An error occurred while saving to local storage:", error);
    }
  };

  const downloadPlotAsImage = () => {
    // Select the area containing the plot and legend
    const plotElement = document.querySelector(".plot-container");

    // Use html2canvas to capture the selected area
    html2canvas(plotElement, {
      // For better quality, you can increase scale, but it will be slower
      scale: 2,
    }).then((canvas) => {
      // Create a download link for the canvas image
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png", 1.0);
      link.download = "dge_analysis_plot_with_legend.png";
      link.click();
    });
  };

  const onExportClick = () => {
    // Function to convert data array to CSV format
    const convertToCSV = (data) => {
      const headers = Object.keys(data[0]).join(","); // Get headers from keys
      const rows = data.map((row) => Object.values(row).join(",")); // Map each row data to comma separated values
      return [headers, ...rows].join("\n"); // Combine headers and rows with newline
    };

    // Creating CSV data for both tables
    const csvDownregulated = convertToCSV(downregulatedGenes);
    const csvUpregulated = convertToCSV(upregulatedGenes);

    // Combining both tables with some differentiation
    const combinedCSV = [
      "Down Regulated Genes\n",
      csvDownregulated,
      "\n",
      "Up Regulated Genes\n",
      csvUpregulated,
    ].join("\n");

    // Initiating the download
    const blob = new Blob([combinedCSV], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", "gene_analysis.csv");
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filterStyle = {
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
    padding: "0 35px",
  };

  return (
    <Box padding="5px 20px">
      {includeTable && (
        <HStack
          mb={4}
          wrap="wrap"
          spacing={4}
          bg="#f5f5f5"
          p="16px"
          borderRadius="xl"
          // w="fit-content"
          // mx="auto"
          mt="20px"
          shadow="sm"
        >
          <Box style={filterStyle}>
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
                  width: "300px",
                  minWidth: "300px",
                  borderRadius: "18px",
                }),
                menu: (provided) => ({
                  ...provided,
                  width: "300px",
                  minWidth: "300px",
                  zIndex: 9999,
                  marginTop: "2px",
                }),
              }}
            />
          </Box>
          <Box style={filterStyle}>
            <p>-log₁₀ p-value Threshold</p>
            <Slider
              min={minPValue}
              max={maxPValue}
              step={0.1}
              value={significanceThreshold}
              onChange={(v) => setSignificanceThreshold(v)}
            >
              <SliderMark
                value={significanceThreshold}
                mt="1"
                ml="-2.5"
                fontSize="sm"
              >
                {significanceThreshold.toFixed(1)}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
          <Box style={filterStyle}>
            <p>log₂ FC Threshold</p>
            <Slider
              min={minLog2FoldChange}
              max={maxLog2FoldChange}
              step={minLog2FoldChange}
              value={foldChangeThreshold}
              onChange={(v) => setFoldChangeThreshold(v)}
            >
              <SliderMark
                value={foldChangeThreshold}
                mt="1"
                ml="-2.5"
                fontSize="sm"
              >
                {
                  foldChangeThreshold === 0
                    ? "0" // Show 0 if the value is exactly zero
                    : Math.abs(foldChangeThreshold) < 1
                    ? foldChangeThreshold.toExponential(2) // Use exponential notation for small values
                    : foldChangeThreshold.toFixed(1) // Use fixed notation for larger values
                }
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </Box>
        </HStack>
      )}

      <div
        className="plot-container"
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          position: "relative",
          // width: "1100px",
          padding: "20px",
          height: "450px",
          margin: "20px auto",
          border: "1px solid #E2E8F0",
          borderRadius: "0.5em",
        }}
      >
        <div style={{ position: "relative" }}>
          {includeTable && (
            <HStack
              spacing={2}
              zIndex={1}
              bg="white"
              p={2}
              borderRadius="md"
              boxShadow="md"
              mb={2}
              width="fit-content"
            >
              <IconButton
                icon={<FaSearchPlus />}
                aria-label="Toggle Zoom"
                title="Toggle Zoom"
                border="0.1px solid #3182ce"
                colorScheme={zoomEnabled ? "blue" : "gray"} // Change color based on state
                size="sm"
                onClick={() => setZoomEnabled((prev) => !prev)} // Toggle zoom
              />
              <IconButton
                icon={<FaUndoAlt />}
                aria-label="Reset Zoom"
                title="Reset Zoom"
                colorScheme="blue"
                size="sm"
                className="reset-zoom"
              />
              <IconButton
                icon={<FaDownload />}
                aria-label="Download Plot"
                title="Download Plot"
                colorScheme="blue" // Use a color scheme to differentiate
                size="sm"
                onClick={downloadPlotAsImage}
              />
            </HStack>
          )}
          <VStack
            spacing={2}
            // position="absolute"
            // top="60px"
            // right="-75px"
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
        </div>

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
      {includeTable && (
        <Box className="border p-4 rounded-md">
          <Flex justifyContent="end" gap="0.5em">
            <Button
              width="fit-content"
              colorScheme="blue"
              size="sm"
              py={5}
              onClick={() => {
                pushDataToEnrichment();
                setActiveComponent("enrichmentAnalysis");
              }}
            >
              <FaUpload className="mr-2" />
              Push Result to Enrichment
            </Button>
            <Button
              colorScheme="blue"
              onClick={onExportClick}
              mb={4}
              width="fit-content"
              size="sm"
              py={5}
            >
              <FaDownload className="mr-2" />
              Download CSV
            </Button>
          </Flex>

          <HStack
            spacing={6}
            mt={4}
            justifyContent="center"
            alignItems="start"
            padding="0 20px"
          >
            {/* Downregulated Genes Table */}
            <VStack width="50%" alignItems="start">
              <Box
                mb={1}
                fontSize="22px"
                fontWeight="semibold"
                color="rgba(0, 0, 0, 0.85)"
              >
                Downregulated Genes
              </Box>

              <div style={{ height: "400px", width: "100%", overflow: "auto" }}>
                <AgGridReact
                  className="ag-theme-quartz w-[800px] mx-0 ml-0"
                  rowData={downregulatedGenes}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    floatingFilter: true,
                  }}
                  pagination={false} // Disable pagination if you want scrollable rows
                  getRowStyle={(params) => ({
                    backgroundColor:
                      params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
                  })}
                />
              </div>
            </VStack>
            {/* Upregulated Genes Table */}
            <VStack width="50%" alignItems="start">
              <Box
                mb={1}
                textAlign="left"
                fontSize="22px"
                fontWeight="semibold"
                color="rgba(0, 0, 0, 0.85)"
              >
                Upregulated Genes
              </Box>

              <div style={{ height: "400px", width: "100%", overflow: "auto" }}>
                <AgGridReact
                  className="ag-theme-quartz w-[800px] mx-0 ml-0"
                  rowData={upregulatedGenes}
                  columnDefs={columnDefs}
                  defaultColDef={{
                    resizable: true,
                    sortable: true,
                    filter: true,
                    floatingFilter: true,
                  }}
                  pagination={false} // Disable pagination if you want scrollable rows
                  getRowStyle={(params) => ({
                    backgroundColor:
                      params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
                  })}
                />
              </div>
            </VStack>
          </HStack>
        </Box>
      )}
      {/* {includeTable && (
       
      )} */}
    </Box>
  );
};

export default DgeAnalysisMain;
