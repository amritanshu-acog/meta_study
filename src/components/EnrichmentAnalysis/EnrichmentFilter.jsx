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
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";

const EnrichmentFilter = ({ onFilterChange, currentFilters }) => {
  const [cellTypeLevel, setCellTypeLevel] = useState(""); // New state for Cell Type Level
  const [comparator, setComparator] = useState("");
  const [cellType, setCellType] = useState("");
  const [significanceThreshold, setSignificanceThreshold] = useState(1);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(1);

  const applyFilters = () => {
    const newFilters = {
      cellTypeLevel,
      comparator,
      cellType,
      significanceThreshold,
      foldChangeThreshold,
    };
  
    // Compare new filters with existing filters
    if (JSON.stringify(newFilters) !== JSON.stringify(currentFilters)) {
      onFilterChange(newFilters); // Trigger filter change
    }
  };

  const cellTypeLevelOptions = ["Fine", "Broad"];
  const comparatorOptions = ["group", "compare"];
  const cellTypeOptions = ["B-cell", "Memory-B_cells"];

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
  
      {/* Comparator */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Comparator:</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={comparator}
          onChange={(e) => setComparator(e.target.value)}
        >
          <option value="">- Select Comparator -</option>
          {comparatorOptions.map((comp) => (
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
          <option value="">- Select Cell Type Level -</option>
          {cellTypeLevelOptions.map((level) => (
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
          <option value="">- Select Cell Type -</option>
          {cellTypeOptions.map((cell) => (
            <option value={cell} key={cell}>
              {cell}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>
  
      {/* p-value Slider */}
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">log₁₀ p-value Threshold:</span>
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
  
      {/* log2FC Slider */}
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
