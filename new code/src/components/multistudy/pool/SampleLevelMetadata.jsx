import React, { useState } from "react";
import {
  Box,
  Table,
  Tbody,
  Th,
  Tr,
  Td,
  Thead,
  HStack,
  Heading,
  Badge,
  Text,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Input,
} from "@chakra-ui/react";
import MappingTable from "./MappingTable"; // Ensure this import is here if it's used

const SampleLevelMetadata = ({ metadata, allColumns }) => {
  const [mapValues, setMapValues] = useState("no");
  const [comparatorVariables, setComparatorVariables] = useState([]);
  const [comparatorMap, setComparatorMap] = useState({});
  const [selectedComparator, setSelectedComparator] = useState(null);
  const [newVariable, setNewVariable] = useState("");
  const [newMapperVariable, setNewMapperVariable] = useState("");
  const [showMapper, setShowMapper] = useState(false);
  const [showTable, setShowTable] = useState(false);

  const handleAddNewVariable = () => {
    if (newVariable.trim() !== "") {
      setComparatorVariables([...comparatorVariables, newVariable.trim()]);
      setComparatorMap({
        ...comparatorMap,
        [newVariable.trim()]: [],
      });
      setNewVariable("");
    }
  };

  const handleSaveVariables = () => {
    setShowMapper(true);
    setSelectedComparator(comparatorVariables[0]);
  };

  const handleAddNewMapperVariable = () => {
    if (
      newMapperVariable.trim() !== "" &&
      selectedComparator &&
      selectedComparator in comparatorMap
    ) {
      setComparatorMap({
        ...comparatorMap,
        [selectedComparator]: [
          ...comparatorMap[selectedComparator],
          newMapperVariable.trim(),
        ],
      });
      setNewMapperVariable("");
    }
  };

  const handleProceedWithMapping = () => {
    setShowTable(true);
  };

  const handleComparatorSelect = (comparator) => {
    setSelectedComparator(comparator);
  };

  return (
    
    <Box width="full">
         <Heading size="lg" my={4}>
          Sample Level Metadata
        </Heading>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Study ID / Node ID</Th>
            {allColumns.map((column) => (
              <Th key={column}>
                {column.charAt(0).toUpperCase() + column.slice(1)}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {metadata.map((meta, index) => (
            <React.Fragment key={`${meta.studyId}_${meta.nodeId}`}>
              {index > 0 && (
                <Tr>
                  <Td colSpan={allColumns.length + 1} p={0}>
                    <Box h="2px" bg="gray.100" />
                  </Td>
                </Tr>
              )}
              <Tr>
                <Td fontWeight="medium">
                  {meta.studyReadableId}
                  <Text fontSize="sm" color="gray.500">
                    Node: {meta.nodeId}
                  </Text>
                </Td>
                {allColumns.map((column) => (
                  <Td key={column}>
                    <HStack spacing={1} flexWrap="wrap">
                      {meta.data[column]?.map((value, i) => (
                        <Badge key={i} variant="outline">
                          {value}
                        </Badge>
                      ))}
                    </HStack>
                  </Td>
                ))}
              </Tr>
            </React.Fragment>
          ))}
        </Tbody>
      </Table>

      <Box width="full" mt={4}>
        <Text fontWeight="bold" mb={2}>
          Do you want to map values:
        </Text>
        <RadioGroup onChange={setMapValues} value={mapValues}>
          <Stack direction="row" spacing={4}>
            <Radio value="yes">YES</Radio>
            <Radio value="no">NO</Radio>
          </Stack>
        </RadioGroup>
      </Box>

      {mapValues === "yes" && (
        <Box width="full" mt={4}>
          <Text fontWeight="bold" mb={2}>
            Comparator Variable Name:
          </Text>
          <HStack spacing={4} mb={2}>
            {comparatorVariables.map((variable, index) => (
              <Badge
                key={index}
                variant="solid"
                px={2}
                py={1}
                cursor="pointer"
                onClick={() => handleComparatorSelect(variable)}
                colorScheme={selectedComparator === variable ? "blue" : "gray"}
              >
                {variable}
              </Badge>
            ))}

            {!showMapper && (
              <>
                <Input
                  placeholder="Add new variable"
                  value={newVariable}
                  onChange={(e) => setNewVariable(e.target.value)}
                  width="auto"
                />
                <Button onClick={handleAddNewVariable}>+ Add new</Button>
                <Button
                  colorScheme="blue"
                  onClick={handleSaveVariables}
                  variant="solid"
                >
                  Save
                </Button>
              </>
            )}
          </HStack>
        </Box>
      )}

      {showMapper && (
        <Box width="full" mt={4}>
          <Text fontWeight="bold" mb={2}>
            Mapper for {selectedComparator}:
          </Text>
          <HStack spacing={4} mb={2}>
            {comparatorMap[selectedComparator].map((mapper, index) => (
              <Badge key={index} variant="solid" px={2} py={1}>
                {mapper}
              </Badge>
            ))}
            <Input
              placeholder="Add new mapper"
              value={newMapperVariable}
              onChange={(e) => setNewMapperVariable(e.target.value)}
              width="auto"
            />
            <Button onClick={handleAddNewMapperVariable}>+ Add new</Button>
            {!showTable && (
              <Button
                colorScheme="blue"
                onClick={handleProceedWithMapping}
                variant="solid"
              >
                Proceed with Mapping
              </Button>
            )}
          </HStack>
        </Box>
      )}

      {showTable && (
        <MappingTable
          metadata={metadata}
          comparatorMap={comparatorMap}
          comparator={selectedComparator}
        />
      )}
    </Box>
  );
};

export default SampleLevelMetadata;
