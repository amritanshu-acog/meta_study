import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Box, IconButton, HStack } from "@chakra-ui/react";
import { FaSearchPlus, FaUndoAlt } from "react-icons/fa";

const GeneUMAPPlot = ({
  data,
  minGeneExpression,
  maxGeneExpression,
  selectedMinValue,
}) => {
  const canvasRef = useRef(null);
  const zoomRef = useRef(null);
  const [zoomEnabled, setZoomEnabled] = useState(false);

  const margin = { top: 20, right: 30, bottom: 40, left: 50 };

  useEffect(() => {
    if (!data) return;

    const colorScale = d3
      .scaleLinear()
      .domain([minGeneExpression, maxGeneExpression])
      .range(["rgb(220,220,220)", "rgb(255,0,0)"]);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width - margin.left - margin.right;
    const height = canvas.height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(data.x1))
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(data.x2))
      .range([height, 0]);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.translate(margin.left, margin.top);

      data.x1.forEach((x1, i) => {
        const expressionValue = data.gene_expression[i];
        const x = xScale(x1);
        const y = yScale(data.x2[i]);

        if (selectedMinValue === null || expressionValue >= selectedMinValue) {
          const color = colorScale(expressionValue);
          ctx.beginPath();
          ctx.arc(x, y, 0.5, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.fill();
        }
      });

      ctx.restore();
    };

    draw();

    const zoom = d3
      .zoom()
      .scaleExtent([1, 10])
      .on("zoom", (event) => {
        const transform = event.transform;

        ctx.save();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);
        draw();
        ctx.restore();
      });

    if (zoomEnabled) {
      d3.select(canvas).call(zoom);
      zoomRef.current = zoom;
    } else {
      d3.select(canvas).on(".zoom", null);
    }
  }, [
    data,
    minGeneExpression,
    maxGeneExpression,
    selectedMinValue,
    zoomEnabled,
  ]);

  const handleToggleZoom = () => {
    setZoomEnabled(!zoomEnabled);
  };

  const handleResetZoom = () => {
    const canvas = canvasRef.current;
    if (zoomRef.current) {
      d3.select(canvas)
        .transition()
        .duration(500)
        .call(zoomRef.current.transform, d3.zoomIdentity);
    }
    setZoomEnabled(false);
  };

  return (
    <Box
      position="relative"
      borderWidth="2px"
      borderColor="gray.300"
      borderRadius="md"
      width="380px"
      height="380px"
      padding="10px"
      boxSizing="border-box"
    >
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
          icon={<FaSearchPlus />}
          aria-label="Toggle Zoom"
          colorScheme={zoomEnabled ? "blue" : "gray"}
          size="xs"
          onClick={handleToggleZoom}
        />
        <IconButton
          icon={<FaUndoAlt />}
          aria-label="Reset Zoom"
          colorScheme="blue"
          size="xs"
          onClick={handleResetZoom}
          zIndex={1}
        />
      </HStack>

      <canvas
        ref={canvasRef}
        width="400"
        height="400"
        style={{ width: "100%", height: "100%" }}
      ></canvas>
    </Box>
  );
};

export default GeneUMAPPlot;
