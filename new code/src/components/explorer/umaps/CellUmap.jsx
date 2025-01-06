import React, { useState, useRef, useEffect } from "react";
import { Box, HStack, VStack } from "@chakra-ui/react";
import * as d3 from "d3";
import ScatterPlotLegend from "./ScatterPlotLegend";
import DgeOnline from "./DgeOnline";
import ScatterPlot from "./ScatterPlot";

const CellUmap = ({
  plotData = [], // Ensure plotData has a default value
  color,
  plotLabel = [], // Ensure plotLabel has a default value
  setActiveComponent,
  includeTable = true,
  cellUmapRef,
  scope,
}) => {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const labels = Array.from(new Set(plotData.flatMap((data) => data.category)));
  const [displayMode, setDisplayMode] = useState("legend");
  const [selectedLabels, setSelectedLabels] = useState(new Set());

  const dgeSelection = useRef([]); // It will maintain two arrays at most
  useEffect(() => {
    dgeSelection.current = [];
  }, [displayMode, selectedLabels]);
  return (
    <div className="border border-t-0 rounded-md p-4 rounded-tl-none rounded-tr-none">
      <VStack ref={cellUmapRef} marginBottom="20px">
        <HStack flexWrap="wrap" gap="50px" marginBottom="20px">
          {plotData.map((data, index) => (
            <ScatterPlot
              plotData={data}
              plotLabel={plotLabel[index]}
              commonColorScale={colorScale}
              displayMode={displayMode}
              selectedLabels={selectedLabels}
              dgeSelection={dgeSelection}
              key={index}
              includeTable={includeTable}
              scope={scope}
            />
          ))}
        </HStack>

        <ScatterPlotLegend
          labels={labels}
          displayMode={displayMode}
          selectedLabels={selectedLabels}
          commonColorScale={colorScale}
          setSelectedLabels={setSelectedLabels}
          setDisplayMode={setDisplayMode}
          includeTable={includeTable}
          scope={scope}
        />
      </VStack>
      <Box className="mt-5 p-4 pl-0">
        <DgeOnline
          dgeSelectionData={dgeSelection}
          color={color}
          setActiveComponent={setActiveComponent}
          includeTable={includeTable}
        />
      </Box>
    </div>
  );
};

export default React.memo(CellUmap);
