import React, { useState, useEffect } from "react";
import {
  VStack,
  Heading,
  Icon,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Button,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Switch,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";

const EnrichmentFilter = ({
  onFilterChange,
  currentFilters,
  onDataReceived,
}) => {
  const [significanceThreshold, setSignificanceThreshold] = useState(1);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(1);

  const [filterOptions, setFilterOptions] = useState({
    splitByKeys: [],
    comparisons: [],
    cellTypeLevels: [],
    cellTypes: [],
    shrinkages: [],
  });

  const [splitByKey, setSplitByKey] = useState("");
  const [comparison, setComparison] = useState("");
  const [cellTypeLevel, setCellTypeLevel] = useState("");
  const [cellType, setCellType] = useState("");
  const [shrinkage, setShrinkage] = useState(false);

  // Fetch filter options on component mount
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
        console.log("Fetched Data:", data);

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

        setFilterOptions({
          splitByKeys: uniqueSplitByKeys,
          comparisons: uniqueComparisons,
          cellTypeLevels: uniqueCellTypeLevels,
          cellTypes: uniqueCellTypes,
          shrinkages: uniqueShrinkages,
        });

         // Set default values for filters
         const defaultSplitByKey = uniqueSplitByKeys[0] || "";
         const defaultComparison = uniqueComparisons[0] || "";
         const defaultCellTypeLevel = uniqueCellTypeLevels[0] || "";
         const defaultCellType = uniqueCellTypes[0] || "";
         const defaultShrinkage = uniqueShrinkages[0] || false;
 
         setSplitByKey(defaultSplitByKey);
         setComparison(defaultComparison);
         setCellTypeLevel(defaultCellTypeLevel);
         setCellType(defaultCellType);
         setShrinkage(defaultShrinkage);
 
         // Automatically apply filters after setting default values
         const defaultFilters = {
           splitByKey: defaultSplitByKey,
           comparison: defaultComparison,
           cellTypeLevel: defaultCellTypeLevel,
           cellType: defaultCellType,
           shrinkage: defaultShrinkage,
           log10_pvalue_threshold: significanceThreshold,
           log2_fold_change_threshold: foldChangeThreshold,
         };
 
         // Call fetchData with default filters
         fetchData(defaultFilters);
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  const applyFilters = () => {
    const newFilters = {
      splitByKey,
      comparison,
      cellTypeLevel,
      cellType,
      shrinkage,
      log10_pvalue_threshold: significanceThreshold,
      log2_fold_change_threshold: foldChangeThreshold,
    };

    console.log("Filters to be applied:", newFilters);

    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      onFilterChange(newFilters);
      fetchData(newFilters);
    }
  };

  const fetchData = async (filters) => {
    const metastudy_id = "d344c323-31ac-4c45-b932-096f3cbb238d";
    const url = `https://scverse-api-dev-stable.own4.aganitha.ai:8443/ea/metastudy-genes/${metastudy_id}?split_by_key=${
      filters.splitByKey
    }&comparison=${filters.comparison}&cell_type_level=${
      filters.cellTypeLevel
    }&cell_type=${encodeURIComponent(filters.cellType)}&shrinkage=${
      filters.shrinkage
    }&pvalue_threshold=${
      filters.log10_pvalue_threshold
    }&log2_fold_change_threshold=${filters.log2_fold_change_threshold}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });
      const data = await response.json();
      console.log("Fetched Data:", data);
      onDataReceived(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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

      {/* Split By Key */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Split By Key:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={splitByKey}
          onChange={(e) => setSplitByKey(e.target.value)}
        >
          {filterOptions.splitByKeys.map((key) => (
            <option value={key} key={key}>
              {key}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Comparison */}
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
          {filterOptions.comparisons.map((comp) => (
            <option value={comp} key={comp}>
              {comp}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Cell Type Level */}
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
          {filterOptions.cellTypeLevels.map((level) => (
            <option value={level} key={level}>
              {level}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Cell Type */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Cell Type:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={cellType}
          onChange={(e) => setCellType(e.target.value)}
        >
          {filterOptions.cellTypes.map((cell) => (
            <option value={cell} key={cell}>
              {cell}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Shrinkage */}
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
          {filterOptions.shrinkages.map((shrink) => (
            <option value={shrink} key={shrink}>
              {shrink ? "True" : "False"}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* log10 p-value Slider */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">
            log₁₀ p-value Threshold:
          </span>
        </FormLabel>
        <Slider
          min={0}
          max={5}
          step={0.01}
          value={significanceThreshold}
          onChange={setSignificanceThreshold}
        >
          <SliderMark
            value={significanceThreshold}
            mt="1"
            ml="-2.5"
            fontSize="xs"
          >
            {significanceThreshold}
          </SliderMark>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
      </FormControl>

      {/* log2 Fold Change Slider */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">log₂ FC Threshold:</span>
        </FormLabel>
        <Slider
          min={-5}
          max={5}
          step={0.1}
          value={foldChangeThreshold}
          onChange={setFoldChangeThreshold}
        >
          <SliderMark
            value={foldChangeThreshold}
            mt="1"
            ml="-2.5"
            fontSize="xs"
          >
            {foldChangeThreshold}
          </SliderMark>
          <SliderTrack>
            <SliderFilledTrack />
          </SliderTrack>
          <SliderThumb />
        </Slider>
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

export default EnrichmentFilter;
