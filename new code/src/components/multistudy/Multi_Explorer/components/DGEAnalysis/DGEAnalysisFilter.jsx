import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Icon,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Button,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";
const DGEAnalysisFilter = ({ onApplyFilters }) => {
  const [studyNames, setStudyNames] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    splitByKeys: [],
    comparisons: [],
    cellTypeLevels: [],
    cellTypes: [],
    shrinkages: [],
  });
  const [selectedFilters, setSelectedFilters] = useState({
    splitByKey: "group",
    comparison: "diseased_vs_healthy",
    cellTypeLevel: "fine",
    cellType: "Naive B Cells",
    shrinkage: false,
  });
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    const fetchFilterOptions = async () => {
      const metastudyId = "d344c323-31ac-4c45-b932-096f3cbb238d";
      const url = `https://scverse-api-dev-stable.own4.aganitha.ai:8443/${metastudyId}/metastudy-dge/filters`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch filters: ${response.statusText}`);
        }

        const data = await response.json();

        // Extract filter options
        const humanReadableStudyIds = data.human_readable_study_ids;
        const dgeFilters = data.dge_filters;

        const uniqueSplitByKeys = [
          ...new Set(dgeFilters.map((item) => item.split_by_key)),
        ];
        const uniqueComparisons = [
          ...new Set(dgeFilters.map((item) => item.comparison)),
        ];
        const uniqueCellTypeLevels = [
          ...new Set(dgeFilters.map((item) => item.cell_type_level)),
        ];
        const uniqueCellTypes = [
          ...new Set(dgeFilters.map((item) => item.cell_type)),
        ];
        const uniqueShrinkages = [
          ...new Set(dgeFilters.map((item) => item.shrinkage)),
        ];

        // Update state
        setStudyNames(humanReadableStudyIds);
        setFilterOptions({
          splitByKeys: uniqueSplitByKeys,
          comparisons: uniqueComparisons,
          cellTypeLevels: uniqueCellTypeLevels,
          cellTypes: uniqueCellTypes,
          shrinkages: uniqueShrinkages,
        });
        
        // Trigger analysis on component mount with default selected filters
        if (!filtersApplied) {
          applyFilters();
        }
        
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, [filtersApplied]); // When filtersApplied is false, trigger fetch on mount

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setSelectedFilters((prev) => {
      // Convert shrinkage value to boolean if it's for shrinkage
      if (name === "shrinkage") {
        return {
          ...prev,
          [name]: value === "true" ? true : value === "false" ? false : null,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const applyFilters = () => {
    if (onApplyFilters) {
      // Set filtersApplied flag to true so that when filters are changed, the analysis is triggered
      setFiltersApplied(true);
      onApplyFilters(selectedFilters, studyNames);
    }
  };

  useEffect(() => {
    if (filtersApplied) {
      // Reset the filtersApplied flag after triggering the analysis
      setFiltersApplied(false);
    }
  }, [filtersApplied]);


  return (
    <VStack
      w="100%"
      minW="200px"
      maxW="1000px"
      p={4}
      align="stretch"
      spacing={4}
      className="text-xs"
      overflowY="scroll"
    >
      <Heading
        size="sm"
        className="flex items-center gap-2 mb-2 text-sm"
        color="#7B0000"
      >
        <Icon as={FaFilter} /> Filters
      </Heading>

      {/* Split By Key Filter */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Split By Key:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          name="splitByKey"
          value={selectedFilters.splitByKey}
          onChange={handleFilterChange}
        >
          <option value="">- Select Split By Key -</option>
          {filterOptions.splitByKeys.map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Comparison Filter */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Comparison:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          name="comparison"
          value={selectedFilters.comparison}
          onChange={handleFilterChange}
        >
          <option value="">- Select Comparison -</option>
          {filterOptions.comparisons.map((comp) => (
            <option value={comp} key={comp}>
              {comp}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Cell Type Level Filter */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Cell Type Level:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          name="cellTypeLevel"
          value={selectedFilters.cellTypeLevel}
          onChange={handleFilterChange}
        >
          <option value="">- Select Cell Type Level -</option>
          {filterOptions.cellTypeLevels.map((level) => (
            <option value={level} key={level}>
              {level}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Cell Type Filter */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Cell Type:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          name="cellType"
          value={selectedFilters.cellType}
          onChange={handleFilterChange}
        >
          <option value="">- Select Cell Type -</option>
          {filterOptions.cellTypes.map((cell) => (
            <option value={cell} key={cell}>
              {cell}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Shrinkage Filter */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Shrinkage:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          name="shrinkage"
          value={selectedFilters.shrinkage}
          onChange={handleFilterChange}
        >
          <option value="">- Select Shrinkage -</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </ChakraSelect>
      </FormControl>

      <Button
        mt={4}
        color="black"
        colorScheme="red"
        variant="solid"
        bg="#F5F5F5"
        fontSize="sm"
        borderRadius="20px"
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </VStack>
  );
};

export default DGEAnalysisFilter;
