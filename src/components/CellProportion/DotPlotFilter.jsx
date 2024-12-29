import React, { useState } from "react";
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

const DotPlotFilter = () => {
  const [cellTypeLevel, setCellTypeLevel] = useState(""); // New state for Cell Type Level
  const [comparator, setComparator] = useState("");
  const [comparison, setComparison] = useState("");

  // const [cellType, setCellType] = useState("");

  const cellTypeLevelOptions = ["Fine", "Broad"]; // Options for Cell Type Level
  const comparatorOptions = ["group", "compare"];
  const comparisonOptions = ["Before vs After"];

  const applyFilters = () => {
    console.log("Applied Filters:");
    console.log("Cell Type Level:", cellTypeLevel);
    console.log("Comparator:", comparator);
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
        > <option value="">- Select Comparison -</option>
          {comparisonOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      {/* Select Cell Type Level */}
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

export default DotPlotFilter;
