import React, { useContext } from "react";
import { MappingContext } from "./MappingContext"; // Ensure correct import path
import {
  Box,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";

const PreviewMapping = () => {
  const { cellLevelMappings, sampleLevelMappings } = useContext(MappingContext);

  const renderSampleLevelMappings = (sampleData) => {
    if (!sampleData || Object.keys(sampleData).length === 0) {
      return <Text>No sample level mappings available</Text>;
    }

    return Object.entries(sampleData).map(([comp, studies], compIdx) => {
      const mapperNames = new Set();
      Object.values(studies).forEach((fields) => {
        Object.entries(fields).forEach(([metadataKey, values]) => {
          Object.keys(values).forEach((mapper) => {
            if (mapper !== "unmapped") {
              mapperNames.add(mapper.toUpperCase());
            }
          });
        });
      });

      return (
        <Box
          key={compIdx}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          width="100%"
          mb={4}
        >
          <Text
            fontWeight="bold"
            mb={2}
          >{`Comparator variable name: ${comp}`}</Text>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Study & Pipeline</Th>
                <Th>Selected Metadata</Th>
                {[...mapperNames].map((mapper) => (
                  <Th key={mapper}>{mapper}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {Object.entries(studies).map(([studyId, fields], studyIdx) =>
                Object.entries(fields).map(([metadataKey, values]) => (
                  <Tr key={`${studyIdx}-${metadataKey}`}>
                    <Td>
                      <Text fontWeight="bold">{studyId}</Text>
                    </Td>
                    <Td>{metadataKey}</Td>
                    {[...mapperNames].map((mapper) => (
                      <Td key={mapper}>
                        <VStack align="start">
                          {(Array.isArray(values[mapper.toLowerCase()])
                            ? values[mapper.toLowerCase()]
                            : []
                          ).map((value, idx) => (
                            <Text key={idx}>{value}</Text>
                          ))}
                        </VStack>
                      </Td>
                    ))}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      );
    });
  };

  const renderCellLevelMappings = (cellData) => {
    if (!cellData || Object.keys(cellData).length === 0) {
      return <Text>No cell type level mappings available</Text>;
    }

    return Object.entries(cellData).map(([level, data], levelIdx) => {
      const studyIds = Array.from(
        new Set(data.flatMap(({ chips }) => chips.map((chip) => chip.studyId)))
      );

      return (
        <Box
          key={levelIdx}
          p={4}
          borderWidth="1px"
          borderRadius="md"
          width="100%"
          mb={4}
        >
          <Text
            fontWeight="bold"
            mb={2}
          >{`Selected celltype level: ${level}`}</Text>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Variable Name</Th>
                {studyIds.map((studyId) => (
                  <Th key={studyId}>{studyId}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data.map(({ title, chips }, index) => (
                <Tr key={index}>
                  <Td>
                    <Text fontWeight="bold">{title}</Text>
                  </Td>
                  {studyIds.map((studyId) => (
                    <Td key={studyId}>
                      <VStack align="start">
                        {chips
                          .filter((chip) => chip.studyId === studyId)
                          .map((chip, idx) => (
                            <Text key={idx}>{chip.type}</Text>
                          ))}
                      </VStack>
                    </Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      );
    });
  };

  return (
    <VStack spacing={6} align="start" p={4}>
      <Text fontSize="2xl">Preview of Saved Mappings</Text>

      <Text fontWeight="bold" fontSize="xl" mt={4} mb={2}>
        Sample Level Mappings
      </Text>
      {renderSampleLevelMappings(sampleLevelMappings)}

      <Text fontWeight="bold" fontSize="xl" mt={4} mb={2}>
        Cell Type Level Mappings
      </Text>
      {renderCellLevelMappings(cellLevelMappings)}
    </VStack>
  );
};

export default PreviewMapping;
