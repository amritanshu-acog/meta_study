import React, { useState, useEffect } from "react";
import { Box, Flex, Text } from "@chakra-ui/react";
import GeneUMAPPlot from "./GeneUmapPlot"; // Import the new component
import * as d3 from "d3";

const GeneUMAP = ({ plotData, geneUmapRef }) => {
  const [minGeneExpression, setMinGeneExpression] = useState(Infinity);
  const [maxGeneExpression, setMaxGeneExpression] = useState(-Infinity);
  const [selectedMinValue, setSelectedMinValue] = useState(null);

  useEffect(() => {
    if (!plotData || plotData.length === 0) return;

    let newMinGeneExpression = Infinity;
    let newMaxGeneExpression = -Infinity;

    plotData.forEach((data) => {
      const localMin = d3.min(data.gene_expression);
      const localMax = d3.max(data.gene_expression);
      newMinGeneExpression = Math.min(newMinGeneExpression, localMin);
      newMaxGeneExpression = Math.max(newMaxGeneExpression, localMax);
    });

    setMinGeneExpression(newMinGeneExpression);
    setMaxGeneExpression(newMaxGeneExpression);
  }, [plotData]);

  const createGradientLegend = () => {
    const gradient = [];
    const numStops = 100;

    for (let i = 0; i <= numStops; i++) {
      const percent = i / numStops;
      const color = d3.interpolateRgb(
        "rgb(220,220,220)",
        "rgb(255,0,0)"
      )(percent);
      gradient.push(
        <Box
          key={i}
          flex="1"
          height="20px"
          backgroundColor={color}
          onClick={(event) => handleLegendClick(event, percent)}
          cursor="pointer"
        />
      );
    }
    return gradient;
  };

  const handleLegendClick = (event, percent) => {
    const clickedValue =
      minGeneExpression + percent * (maxGeneExpression - minGeneExpression);

    if (percent === 0) {
      setSelectedMinValue(null);
    } else {
      setSelectedMinValue(clickedValue);
    }
  };

  return (
    <>
      <Box
        ref={geneUmapRef}
        className="relative border border-t-0 rounded-md p-4 pt-12 rounded-tl-none rounded-tr-none"
      >
        <Flex wrap="wrap" justifyContent="flex-start" gap="60px">
          {plotData.map((data, index) => (
            <GeneUMAPPlot
              key={index}
              data={data}
              index={index}
              minGeneExpression={minGeneExpression}
              maxGeneExpression={maxGeneExpression}
              selectedMinValue={selectedMinValue}
            />
          ))}
        </Flex>

        <Flex flexDirection="column" alignItems="left" mt={12}>
          <Text fontSize="lg" fontWeight="bold">
            Gene Expression Scale
          </Text>

          <Flex width="400px" mt={2}>
            {createGradientLegend()}
          </Flex>

          <Flex justifyContent="space-between" width="400px" mt={1}>
            <Text>
              {minGeneExpression !== Infinity
                ? minGeneExpression.toFixed(2)
                : "N/A"}
            </Text>
            <Text>
              {maxGeneExpression !== -Infinity
                ? maxGeneExpression.toFixed(2)
                : "N/A"}
            </Text>
          </Flex>

          {selectedMinValue != null && (
            <Text color="blue.600" mt={2}>
              Displaying points with gene expression between{" "}
              {selectedMinValue.toFixed(2)} and {maxGeneExpression.toFixed(2)}
            </Text>
          )}
        </Flex>
      </Box>
    </>
  );
};

export default GeneUMAP;
