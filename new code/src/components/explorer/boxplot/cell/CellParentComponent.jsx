import React, { useRef, useEffect, useState } from "react";
import { Box, Flex, IconButton, Switch, Text } from "@chakra-ui/react";
import { FaUndoAlt, FaSearchPlus, FaDownload } from "react-icons/fa";
import BoxPlot from "./CellBoxPlot";
import Legend from "../Legend";
import * as d3 from "d3";
import BoxPlotTable from "./BoxPlotTable";
import html2canvas from "html2canvas-pro";

const CellParentComponent = ({
  cellData,
  split_prop,
  containerDiv,
  includeTable = true,
  scope,
}) => {
  const canvasRef = useRef(null);
  const legendRef = useRef(null);
  const resetZoomRef = useRef();
  const combinedRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);

  const [isSplit, setIsSplit] = useState(true);

  const downloadPlotAsImage = () => {
    const plotCanvas = canvasRef.current;
    if (!plotCanvas) {
      console.error("Plot canvas not found");
      return;
    }

    html2canvas(legendRef.current).then((legendImage) => {
      const combinedCanvas = document.createElement("canvas");
      const combinedContext = combinedCanvas.getContext("2d");

      const legendHeight = legendImage.height;

      combinedCanvas.width = plotCanvas.width;
      combinedCanvas.height = plotCanvas.height + legendHeight + 20;

      combinedContext.fillStyle = "white";
      combinedContext.fillRect(
        0,
        0,
        combinedCanvas.width,
        combinedCanvas.height
      );

      combinedContext.drawImage(plotCanvas, 0, 0);
      combinedContext.drawImage(legendImage, 0, plotCanvas.height + 10);

      const imageURL = combinedCanvas.toDataURL("image/png");

      const downloadLink = document.createElement("a");
      downloadLink.href = imageURL;
      downloadLink.download = "boxplot_with_legend.png";
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

  useEffect(() => {
    if (containerDiv) {
      containerDiv.innerHTML = "";
      const rootNode = combinedRef.current.cloneNode(true);
      containerDiv.appendChild(rootNode);
    }
  }, [containerDiv]);

  const containerWidth = 1160;
  const containerHeight = 600;

  const mode = isSplit ? "split" : "merge";

  return (
    <Flex direction="column" align="left" mt={4} ref={combinedRef}>
      {includeTable && (
        <Flex alignItems="center" mb={4}>
          <Text
            fontWeight="bold"
            color={isSplit ? "gray.800" : "gray.600"}
            mr={2}
          >
            Split
          </Text>
          <Switch
            id="mode-switch"
            isChecked={!isSplit}
            onChange={() => setIsSplit(!isSplit)}
            colorScheme="blue"
            mx={2}
          />
          <Text
            fontWeight="bold"
            color={!isSplit ? "gray.800" : "gray.600"}
            ml={2}
          >
            Merge
          </Text>
        </Flex>
      )}

      <Box
        backgroundColor="white"
        p={4}
        border="1px solid #ccc"
        width="fit-content"
        boxSizing="border-box"
      >
        <Box
          border="1px solid #b6b6b6"
          width={`${containerWidth}px`}
          height={`${containerHeight}px`}
          overflow="visible"
          position="relative"
        >
          {includeTable && (
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
          )}
          {console.log(cellData)}
          <BoxPlot
            plotData={cellData}
            split_prop={split_prop}
            canvasRef={canvasRef}
            resetZoom={resetZoomRef}
            zoomEnabled={zoomEnabled}
            scope={scope}
            mode={mode}
          />
        </Box>

        <Box
          mt={8}
          p={2}
          backgroundColor="#f5f5f5"
          borderRadius="md"
          border="1px solid #ccc"
          width="fit-content"
          boxSizing="border-box"
          ref={legendRef}
        >
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
      {includeTable && (
        <Box mt={8}>
          <BoxPlotTable plotData={cellData} mode={mode} />
        </Box>
      )}
    </Flex>
  );
};

export default CellParentComponent;
