import React, { useEffect, useState } from "react";
import {
  Flex,
  Box,
} from "@chakra-ui/react";
import GeneExpressionFilter from "../../components/GeneExpression/GeneExpressionFilter";
import GeneExpression from "../../components/GeneExpression/GeneExpression";
import Loader from "../../loader/Loader"; // Import your custom loader component

const GeneExpressionPage = () => {
  const [formattedData, setFormattedData] = useState([]);
  const [filters, setFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Track loading state

  const handleApplyFilters = (selectedFilters) => {    
    // Only fetch new data if the filters have changed
    if (
      !filters ||
      filters.splitByKey !== selectedFilters.splitByKey ||
      filters.comparison !== selectedFilters.comparison ||
      filters.cellTypeLevel !== selectedFilters.cellTypeLevel ||
      filters.shrinkage !== selectedFilters.shrinkage
    ) {
      setFilters(selectedFilters);
      fetchFilteredData(selectedFilters); // Fetch data when filters are applied
    } else {
      console.log("Filters have not changed, skipping fetch");
    }
  };
  

  // Function to fetch data based on filters
  const fetchFilteredData = async (selectedFilters) => {
    const { splitByKey, comparison, cellTypeLevel, shrinkage } = selectedFilters;
  
    const metastudyId = "d344c323-31ac-4c45-b932-096f3cbb238d"; // Replace with actual ID from params or props
    const url = `https://scverse-api-dev-stable.own4.aganitha.ai:8443/${metastudyId}/dot-plot/gene-expr/data?split_by_key=${splitByKey}&comparison=${comparison}&cell_type_level=${cellTypeLevel}&shrinkage=${shrinkage}`;
  
    setIsLoading(true); // Set loading to true when fetching starts
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
  
      // Format the data to match the desired structure
      const formattedData = data.map((studyData) => ({
        studyName: studyData.human_readable_study_id, // map human_readable_study_id to studyName
        celltypes: Object.entries(studyData.cell_type_vs_data_map).reduce(
          (acc, [celltype, data]) => {
            acc[celltype] = {
              gene: data.gene,
              pvalue: data.pvalue,
              log2FoldChange: data.log2FoldChange,
              pct_1: data.pct_1,
              pct_2: data.pct_2,
            };
            return acc;
          },
          {}
        ),
      }));
  
      setFormattedData(formattedData); // Set the formatted data to state
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    } finally {
      setIsLoading(false); // Set loading to false after the fetch is complete
    }
  };
  
  return (
    <Flex direction="row" w="100%">
      <Box
        height="100%" // Full screen height
        w="20%" // 20% width for the filter
        minW="200px"
        maxW="250px"
        display="flex"
        flexDirection="column"
        overflowY="auto"
        top="0" // Stick to the top of the page
        left="0" // Align to the left
      >
        <GeneExpressionFilter onApplyFilters={handleApplyFilters} />
      </Box>

      <Box
        borderLeft="1px solid #ddd"
        h="100%"
        w="100%" // Takes the remaining space
      >
        {isLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="100%">
            <Loader /> {/* Your custom Loader component */}
          </Box>
        ) : (
          <GeneExpression formattedData={formattedData} />
        )}
      </Box>
    </Flex>
  );
};

export default GeneExpressionPage;
