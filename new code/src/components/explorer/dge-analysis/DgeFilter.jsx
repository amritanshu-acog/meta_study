import React from "react";
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

const DgeFilter = ({
  splitByKeyOptions,
  comparisonOptions,
  cellTypeLevelOptions,
  cellTypeOptions,
  shrinkageOptions,
  selectedFilters,
  setSelectedFilters,
  onApplyFilters,
}) => {
  return (
    <VStack
      w="15%"
      p={4}
      border="none"
      borderWidth={1}
      borderColor="gray.100"
      borderRadius="xl"
      align="stretch"
      spacing={4}
      className="text-xs"
      overflowY="scroll"
      borderRight="1px dotted #d9d9d9"
      borderTopRightRadius="0"
      borderBottomRightRadius="0"
    >
      <Heading
        size="sm"
        className="flex items-center gap-2 mb-2 text-sm" // Tailwind: Adjust text size to smaller
      >
        <Icon as={FaFilter} color="#3182ce" />
        <p className="text-[22px] text-black font-normal">Filters</p>
      </Heading>
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Split By Key :</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={selectedFilters.splitByKey}
          onChange={(e) =>
            setSelectedFilters({
              ...selectedFilters,
              splitByKey: e.target.value,
              comparison: "",
              cellTypeLevel: "",
              cellType: "",
              shrinkage: "",
            })
          }
        >
          <option value="">- Select Split By Key -</option>
          {splitByKeyOptions.map((key, index) => (
            <option key={index} value={key}>
              {key}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Comparison :</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={selectedFilters.comparison}
          onChange={(e) =>
            setSelectedFilters({
              ...selectedFilters,
              comparison: e.target.value,
            })
          }
          isDisabled={!selectedFilters.splitByKey}
        >
          <option value="">- Select Comparison -</option>
          {comparisonOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">
            Select Cell Type Level :
          </span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={selectedFilters.cellTypeLevel}
          onChange={(e) =>
            setSelectedFilters({
              ...selectedFilters,
              cellTypeLevel: e.target.value,
            })
          }
          isDisabled={!selectedFilters.comparison}
        >
          <option value="">- Select Cell Type Level -</option>
          {cellTypeLevelOptions.map((level, index) => (
            <option key={index} value={level}>
              {level}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Cell Type :</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={selectedFilters.cellType}
          onChange={(e) =>
            setSelectedFilters({ ...selectedFilters, cellType: e.target.value })
          }
          isDisabled={!selectedFilters.cellTypeLevel}
        >
          <option value="">- Select Cell Type -</option>
          {cellTypeOptions.map((type, index) => (
            <option key={index} value={type}>
              {type}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Do you want Shrinkage?</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={selectedFilters.shrinkage}
          onChange={(e) =>
            setSelectedFilters({
              ...selectedFilters,
              shrinkage: e.target.value,
            })
          }
          isDisabled={!selectedFilters.cellType}
        >
          <option value="">- Select Shrinkage -</option>
          {shrinkageOptions.map((option, index) => (
            <option key={index} value={option.toString()}>
              {option ? "Yes" : "No"}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <Button
        mt={4}
        color="black"
        variant="solid"
        bg="#F5F5F5"
        fontSize="sm"
        borderRadius="20px"
        onClick={onApplyFilters}
        isDisabled={!selectedFilters.splitByKey}
      >
        Apply Filters
      </Button>
    </VStack>
  );
};

export default DgeFilter;
