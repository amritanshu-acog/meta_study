import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Icon,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Button,
  Box,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";
import { useParams } from "react-router-dom";

const GeneExpressionFilter = ({ onApplyFilters }) => {
  const [splitByKey, setSplitByKey] = useState("group"); // Default splitByKey
  const [comparison, setComparison] = useState("diseased_vs_healthy"); // Default comparison
  const [cellTypeLevel, setCellTypeLevel] = useState("fine"); // Default cellTypeLevel
  const [shrinkage, setShrinkage] = useState(false); // Default shrinkage (boolean)

  const [filterOptions, setFilterOptions] = useState({
    split_by_key: [],
    comparison: [],
    cell_type_level: [],
    shrinkage: [],
  });

  const { metastudyId } = useParams();

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(
          `https://scverse-api-dev-stable.own4.aganitha.ai:8443/${metastudyId}/dot-plot/filters`
        );
        if (!response.ok) {
          throw new Error(`Error fetching filters: ${response.statusText}`);
        }
        const data = await response.json();

        // Extract unique options for each filter key
        const uniqueSplitByKeys = [...new Set(data.map((item) => item.split_by_key))];
        const uniqueComparisons = [...new Set(data.map((item) => item.comparison))];
        const uniqueCellTypeLevels = [...new Set(data.map((item) => item.cell_type_level))];
        const uniqueShrinkage = [...new Set(data.map((item) => item.shrinkage))];

        setFilterOptions({
          split_by_key: uniqueSplitByKeys,
          comparison: uniqueComparisons,
          cell_type_level: uniqueCellTypeLevels,
          shrinkage: uniqueShrinkage,
        });

        // Send the initial filters when data is fetched
        onApplyFilters({
          splitByKey,
          comparison,
          cellTypeLevel,
          shrinkage,
        });
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };

    if (metastudyId) {
      fetchFilters();
    }
  }, [metastudyId]);

  const applyFilters = () => {
    onApplyFilters({ splitByKey, comparison, cellTypeLevel, shrinkage });
  };


  return (
    <VStack
      h="100%"
      w="100%"
      minW="200px"
      maxW="1000px"
      p={4}
      align="stretch"
      flex="1"
      spacing={4}
      className="text-xs"
      overflowY="auto"
    >
      <Heading
        size="sm"
        className="flex items-center gap-2 mb-2 text-sm"
        color="#7B0000"
      >
        <Icon as={FaFilter} /> Filters
      </Heading>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Split By:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={splitByKey}
          onChange={(e) => setSplitByKey(e.target.value)}
        >
          <option value="">- Select Split By -</option>
          {filterOptions.split_by_key.map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Comparison:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={comparison}
          onChange={(e) => setComparison(e.target.value)}
        >
          <option value="">- Select Comparison -</option>
          {filterOptions.comparison.map((comp) => (
            <option value={comp} key={comp}>
              {comp}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Cell Type Level:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={cellTypeLevel}
          onChange={(e) => setCellTypeLevel(e.target.value)}
        >
          <option value="">- Select Cell Type Level -</option>
          {filterOptions.cell_type_level.map((level) => (
            <option value={level} key={level}>
              {level}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Shrinkage:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={shrinkage}
          onChange={(e) => setShrinkage(e.target.value)}
        >
          <option value="">- Select Shrinkage -</option>
          {filterOptions.shrinkage.map((shrink) => (
            <option value={shrink} key={shrink}>
              {shrink ? "True" : "False"}
            </option>
          ))}
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

export default GeneExpressionFilter;
