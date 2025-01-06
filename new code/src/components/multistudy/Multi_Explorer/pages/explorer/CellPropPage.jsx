import React, { useEffect, useState } from "react";
import { Flex, Box, FormControl, FormLabel, Select } from "@chakra-ui/react";
import DotPlotFilter from "../../components/CellProportion/DotPlotFilter";
import CellProportion from "../../components/CellProportion/CellProportion";
import * as d3 from "d3";

const CellPropPage = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch("/cell_prop_data.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        const allControlValues = jsonData.map((d) => d.cell_prop_control);
        const ranged = d3.max(allControlValues) - d3.min(allControlValues);

        const formattedData = jsonData.map((d) => {
          const cell_prop_scaled = d.cell_prop_control / ranged + 0.2;
          const cell_prop_ratio_d_to_c =
            d.cell_prop_disease / d.cell_prop_control;
          const cell_prop_log_ratio_d_to_c = Math.log2(cell_prop_ratio_d_to_c);

          return {
            study: d.study_name,
            cellType: d.cell_type,
            size: cell_prop_scaled,
            colorValue: cell_prop_log_ratio_d_to_c,
          };
        });

        // Limit to 4 studies
        const limitedData = [];
        const uniqueStudies = new Set();

        for (const dataPoint of formattedData) {
          if (uniqueStudies.size < 4) {
            uniqueStudies.add(dataPoint.study);
            limitedData.push(dataPoint);
          } else if (uniqueStudies.has(dataPoint.study)) {
            limitedData.push(dataPoint);
          }
        }

        setData(limitedData);
      })
      .catch((error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      });
  }, []);

  return (
    <Flex direction="row" h="h-screen" w="100%">
      {/* Filter Section on the Left */}
      <Box
        h="100%"
        w="20%" // Set width to 20%
        minW="200px"
        maxW="250px"
        display="flex"
        flexDirection="column"
        overflowY="auto"
      >
        <DotPlotFilter />
      </Box>

      {/* CellProportion Section on the Right */}
      <Box
        borderLeft="1px solid #ddd"
        w="80%" // Takes the remaining space
      >
        <CellProportion data={data} />
      </Box>
    </Flex>
  );
};

export default CellPropPage;
