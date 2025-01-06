import React, { useRef, useState } from "react";
import { Box, Flex, IconButton } from "@chakra-ui/react";
import { FaDownload, FaSearchPlus, FaUndoAlt } from "react-icons/fa"; // Added FaSyncAlt for reset button
import GeneBoxPlot from "./GeneBoxPlot";
import Legend from "../Legend";
import * as d3 from "d3"; // Import d3 for color scales and zoom
import GeneBoxTable from "./GeneBoxTable";
import html2canvas from "html2canvas-pro";

const ParentComponent = ({ geneData, split_prop }) => {
  const resetZoomRef = useRef();
  const legendRef = useRef(null);
  const canvasRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  // Function to handle exporting the plot as an image
  const downloadPlotAsImage = () => {
    const plotCanvas = canvasRef.current;
    if (!plotCanvas) {
      console.error("Plot canvas not found");
      return;
    }

    // Use html2canvas to capture the legend as an image
    html2canvas(legendRef.current).then((legendImage) => {
      // Create a new canvas where we'll combine the plot and legend
      const combinedCanvas = document.createElement("canvas");
      const combinedContext = combinedCanvas.getContext("2d");

      const legendHeight = legendImage.height;

      // Set the dimensions of the combined canvas
      combinedCanvas.width = plotCanvas.width;
      combinedCanvas.height = plotCanvas.height + legendHeight + 20; // Add some padding

      // Draw white background
      combinedContext.fillStyle = "white";
      combinedContext.fillRect(
        0,
        0,
        combinedCanvas.width,
        combinedCanvas.height
      );

      // Draw the plot
      combinedContext.drawImage(plotCanvas, 0, 0);

      // Draw the legend below the plot
      combinedContext.drawImage(legendImage, 0, plotCanvas.height + 10);

      // Get the data URL of the canvas content
      const imageURL = combinedCanvas.toDataURL("image/png");

      // Create a temporary link element for download
      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = "plot_with_legend.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  };

  const handleZoomToggle = () => {
    setZoomEnabled((prevState) => !prevState);
  };

  const handleReset = () => {
    if (resetZoomRef.current) {
      resetZoomRef.current();
    }
    setZoomEnabled(false);
  };

  return (
    <Flex direction="column" align="left">
      <Box className="border border-t-0 rounded-md p-4 rounded-tl-none rounded-tr-none">
        <Box
          border="1px solid #b6b6b6"
          width="1160px"
          height="600px"
          overflow="hidden"
          position="relative"
        >
          <Flex
            direction="row"
            position="absolute"
            top="10px"
            right="10px"
            zIndex="1"
            gap="10px"
          >
            <IconButton
              icon={<FaSearchPlus />}
              aria-label="Reset Zoom"
              title="Reset Zoom"
              border="0.1px solid #3182ce"
              colorScheme={zoomEnabled ? "blue" : "gray"}
              size="sm"
              onClick={handleZoomToggle}
            />
            <IconButton
              icon={<FaUndoAlt />}
              aria-label="Reset Zoom"
              colorScheme="blue"
              size="sm"
              onClick={handleReset}
            />
            <IconButton
              icon={<FaDownload />}
              aria-label="Download Plot"
              title="Download Plot"
              colorScheme="blue"
              size="sm"
              onClick={downloadPlotAsImage}
            />
          </Flex>

          <GeneBoxPlot
            canvasRef={canvasRef}
            genePlotData={geneData.plot_data}
            split_prop={split_prop}
            resetZoom={resetZoomRef}
            zoomEnabled={zoomEnabled}
          />
        </Box>
        <Box
          mt={8}
          p={2}
          backgroundColor="#f5f5f5"
          borderRadius="md"
          border="1px solid #ccc"
          width="fit-content"
          ref={legendRef}
        >
          <Box spacing={2}>
            <Legend
              colorScale={d3
                .scaleOrdinal()
                .domain(split_prop)
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
                ])}
              groups={split_prop}
            />
          </Box>
        </Box>
      </Box>
      <Box>
        <GeneBoxTable geneTableData={geneData.table_data} />
      </Box>
    </Flex>
  );
};

export default ParentComponent;
