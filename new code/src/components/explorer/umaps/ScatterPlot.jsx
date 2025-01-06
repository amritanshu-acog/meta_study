import React, { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { HStack, IconButton, Box, Text } from "@chakra-ui/react";
import {
  FaUndoAlt,
  FaDrawPolygon,
  FaSearchPlus,
  FaSquare,
  FaRegSquare,
} from "react-icons/fa";

const margin = { top: 10, right: 30, bottom: 30, left: 60 };
const width = 380 - margin.left - margin.right;
const height = 380 - margin.top - margin.bottom;

const ScatterPlot = ({
  plotData,
  plotLabel,
  commonColorScale,
  displayMode,
  selectedLabels,
  dgeSelection,
  includeTable,
  scope = null, // Add the `scope` prop with a default value
}) => {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const zoomRef = useRef(null);
  const currentZoomTransform = useRef(d3.zoomIdentity); // Store the zoom transform
  const inSelectionMode =
    displayMode === "selection" && selectedLabels.size > 0; // If in selection mode with some selected labels.

  const colorScale = commonColorScale;

  const [brushEnabled, setBrushEnabled] = useState(false);
  const [lassoEnabled, setLassoEnabled] = useState(false);
  const [zoomEnabled, setZoomEnabled] = useState(false);
  const [selectedPoints, setSelectedPoints] = useState([]);
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });

  const createScales = () => {
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(plotData.x1))
      .range([margin.left, width + margin.left]);

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(plotData.x2))
      .range([height + margin.top, margin.top]);

    return { xScale, yScale };
  };

  const drawPlot = (
    context,
    scales,
    transform,
    colorScale,
    displayMode,
    selectedLabels,
    scope
  ) => {
    context.clearRect(
      0,
      0,
      width + margin.left + margin.right,
      height + margin.top + margin.bottom
    );

    const zoomedXScale = transform.rescaleX(scales.xScale);
    const zoomedYScale = transform.rescaleY(scales.yScale);

    plotData.x1.forEach((x, i) => {
      const xPos = zoomedXScale(x);
      const yPos = zoomedYScale(plotData.x2[i]);

      const category = plotData.category[i];
      let color;

      if (Array.isArray(scope) && scope.length > 0) {
        // Check if the category is included in the scope array
        color = scope.includes(category) ? colorScale(category) : "#d3d3d3";
      } else if (typeof scope === "string" && category === scope) {
        // If scope is a single string
        color = colorScale(category);
      } else if (
        scope === null &&
        displayMode === "selection" &&
        selectedLabels.size > 0
      ) {
        // Handle the selection mode case
        color = selectedLabels.has(category) ? colorScale(category) : "#d3d3d3";
      } else {
        // Default color if no specific scope or selection mode conditions met
        color = colorScale(category);
      }

      // if (selectedPoints.length !== 0){
      //   color = selectedLabels.has(plotData.category[i])
      //   ? colorScale(plotData.category[i])
      //   : "#d3d3d3";
      // }else{
      //   color = colorScale(plotData.category[i]);
      // }

      context.beginPath();
      context.arc(xPos, yPos, 0.8, 0, 2 * Math.PI);
      context.fillStyle = color;
      context.fill();
    });
  };

  const draw = useCallback(
    (transform = currentZoomTransform.current) => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      const { xScale, yScale } = createScales();

      drawPlot(
        context,
        { xScale, yScale },
        transform,
        colorScale,
        displayMode,
        selectedLabels,
        scope
      );
    },
    [colorScale, displayMode, selectedLabels]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = width + margin.left + margin.right;
    canvas.height = height + margin.top + margin.bottom;

    const { xScale, yScale } = createScales();

    const zoom = d3
      .zoom()
      .scaleExtent([0.8, 10])
      .translateExtent([
        [0, 0],
        [canvas.width, canvas.height],
      ])
      .on("zoom", (event) => {
        currentZoomTransform.current = event.transform;
        draw(event.transform);
      });

    if (zoomEnabled) {
      d3.select(canvas)
        .call(zoom)
        .call(zoom.transform, currentZoomTransform.current);
    } else {
      d3.select(canvas).on(".zoom", null);
    }

    zoomRef.current = zoom;

    draw();

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    let brushGroup;

    // Brush logic
    if (brushEnabled) {
      const updatePlot = (event) => {
        if (event.selection) {
          const [[x0, y0], [x1, y1]] = event.selection;
          const selected = [];

          const transform = currentZoomTransform.current;
          const zoomedXScale = transform.rescaleX(xScale);
          const zoomedYScale = transform.rescaleY(yScale);

          plotData.x1.forEach((x1Val, i) => {
            const x = zoomedXScale(x1Val);
            const y = zoomedYScale(plotData.x2[i]);

            if (x >= x0 && x <= x1 && y >= y0 && y <= y1) {
              if (inSelectionMode) {
                // In case of selection mode only push selected label cells into selection
                const cellCategory = plotData.category[i];
                if (selectedLabels.has(cellCategory))
                  selected.push(plotData.cell_id[i]);
              } else {
                selected.push(plotData.cell_id[i]);
              }
            }
          });

          setSelectedPoints(selected);

          updateDgeSelection(selected);

          // console.log("Brush selected points:", selected);
        }
      };

      const brush = d3
        .brush()
        .extent([
          [0, 0],
          [
            width + margin.left + margin.right,
            height + margin.top + margin.bottom,
          ],
        ])
        .on("start", () => {
          // Optional: Handle any logic during the start of brushing
        })
        // Note: Only update on 'end', not during 'brush'
        .on("end", updatePlot);

      brushGroup = svg.append("g").call(brush);
    } else {
      // Clear any existing brush group
      if (brushGroup) {
        brushGroup.remove();
      }
    }

    // Lasso logic
    if (lassoEnabled) {
      let lassoPath = [];
      const lasso = svg
        .append("path")
        .style("fill", "#0bbfbb")
        .style("opacity", 0.3);

      let dragging = false;

      const onMouseMove = function (event) {
        if (!dragging) return; // Exit if not dragging
        const [x, y] = d3.pointer(event);
        lassoPath.push([x, y]);
        lasso.attr("d", `M${lassoPath.join("L")}Z`);
      };

      svg.on("mousedown", () => {
        lassoPath = [];
        lasso.attr("d", null);
        dragging = true; // Start drag
        svg.on("mousemove", onMouseMove); // Attach mousemove listener
      });

      svg.on("mouseup", () => {
        if (!dragging) return; // Only trigger if dragging was true
        dragging = false; // End drag
        svg.on("mousemove", null); // Detach mousemove listener

        if (lassoPath.length < 3) return; // Ensure valid lasso path

        const transform = currentZoomTransform.current;
        const zoomedXScale = transform.rescaleX(xScale);
        const zoomedYScale = transform.rescaleY(yScale);

        const selected = [];

        plotData.x1.forEach((x1Val, i) => {
          const x = zoomedXScale(x1Val);
          const y = zoomedYScale(plotData.x2[i]);

          if (d3.polygonContains(lassoPath, [x, y])) {
            if (inSelectionMode) {
              // In case of selection mode only push selected label cells into selection
              const cellCategory = plotData.category[i];
              if (selectedLabels.has(cellCategory))
                selected.push(plotData.cell_id[i]);
            } else {
              selected.push(plotData.cell_id[i]);
            }
          }
        });

        setSelectedPoints(selected);
        updateDgeSelection(selected);

        // console.log("Lasso selected points:", selected);

        // Ready to start a new lasso path
        lassoPath = [];
      });
    }

    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;

      let found = false;
      const transform = currentZoomTransform.current;
      const zoomedXScale = transform.rescaleX(xScale);
      const zoomedYScale = transform.rescaleY(yScale);

      for (let i = 0; i < plotData.x1.length; i++) {
        const xPos = zoomedXScale(plotData.x1[i]);
        const yPos = zoomedYScale(plotData.x2[i]);

        const distance = Math.sqrt((xPos - mouseX) ** 2 + (yPos - mouseY) ** 2);
        if (distance < 5) {
          setTooltip({
            visible: true,
            x: xPos,
            y: yPos,
            data: {
              cell_id: plotData.cell_id[i],
              category: plotData.category[i],
              gene_expression: plotData.gene_expression[i],
            },
          });
          found = true;
          break;
        }
      }

      if (!found) {
        setTooltip({ visible: false, x: 0, y: 0, data: null });
      }
    });
  }, [
    brushEnabled,
    lassoEnabled,
    zoomEnabled,
    displayMode,
    selectedLabels,
    colorScale,
  ]);

  const resetZoom = () => {
    const canvas = canvasRef.current;
    const zoom = zoomRef.current;
    setSelectedPoints([]);
    setBrushEnabled(false);
    setLassoEnabled(false);
    currentZoomTransform.current = d3.zoomIdentity;
    d3.select(canvas)
      .transition()
      .duration(750)
      .call(zoom.transform, d3.zoomIdentity);

    removeDgeSelection(plotLabel);
  };

  const toggleBrush = () => {
    setBrushEnabled((enabled) => !enabled);
    setLassoEnabled(false);
    setZoomEnabled(false);
  };

  const toggleLasso = () => {
    setLassoEnabled((enabled) => !enabled);
    setBrushEnabled(false);
    setZoomEnabled(false);
  };

  const toggleZoom = () => {
    setZoomEnabled((enabled) => !enabled);
    setBrushEnabled(false);
    setLassoEnabled(false);
  };

  const updateDgeSelection = (selection) => {
    if (selection.length === 0) return;

    // console.log(selection);

    const newSelectionEntry = { label: plotLabel, selection: selection };
    const newSelections = [...dgeSelection.current];

    // Find the index of an existing entry with the same label
    const existingIndex = newSelections.findIndex(
      (entry) => entry.label === plotLabel
    );

    if (existingIndex !== -1) {
      // If an entry with the same label exists, replace its selection
      newSelections[existingIndex].selection = selection;
    } else {
      // Otherwise, add the new selection entry
      newSelections.push(newSelectionEntry);

      // Ensure that only the two most recent selections are kept
      if (newSelections.length > 2) {
        newSelections.shift();
      }
    }

    dgeSelection.current = newSelections;
  };

  const removeDgeSelection = (selectionToRemove) => {
    dgeSelection.current = dgeSelection.current.filter(
      (selectionEntry) => selectionEntry.label !== selectionToRemove
    );
  };

  return (
    <Box>
      <Box display="flex" justifyContent="center" zIndex={1}></Box>
      <Text
        // backgroundColor="#f5f5f5"
        color="#333"
        border="0.8px solid blue"
        borderRadius="12px"
        padding="6px 16px"
        boxShadow="0px 4px 8px rgba(0, 0, 0, 0.1)"
        textAlign="center"
        fontSize="xs"
        fontWeight="600"
        width="fit-content"
        margin="5px 0"
      >
        {plotLabel && plotLabel.toUpperCase()}
      </Text>
      <div
        style={{
          position: "relative",
          width: "fit-content",
          borderWidth: "2px",
          borderColor: "gray.300",
          borderRadius: "md",
        }}
      >
        <canvas ref={canvasRef}></canvas>
        <svg
          ref={svgRef}
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            pointerEvents: brushEnabled || lassoEnabled ? "all" : "none",
          }}
        ></svg>
        {includeTable && (
          <HStack
            spacing={2}
            position="absolute"
            top="-45px"
            right="0px"
            zIndex={1}
            bg="white"
            p={2}
            borderRadius="md"
            boxShadow="md"
            mb={2}
          >
            <IconButton
              icon={<FaDrawPolygon />}
              title={
                lassoEnabled
                  ? "Turn off lasso selection"
                  : "Turn on lasso selection"
              }
              colorScheme={lassoEnabled ? "blue" : "gray"}
              size="xs"
              onClick={toggleLasso}
            />
            <IconButton
              icon={<FaRegSquare />}
              title={
                brushEnabled
                  ? "Turn off brush selection"
                  : "Turn on brush selection"
              }
              colorScheme={brushEnabled ? "blue" : "gray"}
              size="xs"
              onClick={toggleBrush}
            />
            <IconButton
              icon={<FaSearchPlus />}
              title={zoomEnabled ? "Disable Zoom" : "Enable Zoom"}
              colorScheme={zoomEnabled ? "blue" : "gray"}
              size="xs"
              onClick={toggleZoom}
            />
            <IconButton
              icon={<FaUndoAlt />}
              title="Reset Plot"
              aria-label="Reset Zoom"
              colorScheme="blue"
              size="xs"
              onClick={resetZoom}
            />
          </HStack>
        )}
        {tooltip.visible && (
          <div
            style={{
              position: "absolute",
              left: tooltip.x + 10,
              top: tooltip.y - 20,
              pointerEvents: "none",
              zIndex: 10,
              textAlign: "left",
              width: "max-content",
              padding: "5px 7px",
              font: "12px sans-serif",
              background: "#000000d9",
              color: "#fff",
              border: "0px",
              borderRadius: "8px",
            }}
          >
            <div>
              <strong>Cell ID:</strong> {tooltip.data.cell_id}
            </div>
            <div>
              <strong>Category:</strong> {tooltip.data.category}
            </div>
            <div>
              <strong>Gene Expression:</strong> {tooltip.data.gene_expression}
            </div>
          </div>
        )}
      </div>
    </Box>
  );
};

export default React.memo(ScatterPlot);
