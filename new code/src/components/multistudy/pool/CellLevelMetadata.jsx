import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  Table,
  Tbody,
  Th,
  Tr,
  Td,
  Thead,
  HStack,
  Select,
  Badge,
  Divider,
} from "@chakra-ui/react";
import CellMappingBox from "./CellMappingBox";

const CellLevelMetadata = ({ metadata }) => {
  const [cellTypeLevel, setCellTypeLevel] = useState("Fine");
  const [filteredMetadata, setFilteredMetadata] = useState([]);

  useEffect(() => {
    const updatedMetadata = metadata.map((meta) => ({
      ...meta,
      celltypeData: {
        ...meta.celltypeData,
        [cellTypeLevel]: meta.celltypeData[cellTypeLevel] || [],
      },
    }));

    setFilteredMetadata(updatedMetadata);
  }, [metadata, cellTypeLevel]);

  const getCellTypeData = (meta) => meta.celltypeData[cellTypeLevel] || [];

  return (
    <Box width="full">
      <VStack spacing={4} align="start" width="full">
        <Text fontWeight="bold" mb={2}>
          Select celltype level:
        </Text>
        <Select
          value={cellTypeLevel}
          onChange={(e) => setCellTypeLevel(e.target.value)}
          width="200px"
        >
          <option value="Broad">Broad</option>
          <option value="Fine">Fine</option>
        </Select>

        <Box mt={4} borderWidth="1px" borderRadius="md" overflow="hidden">
          <Table variant="simple" size="sm">
            <Thead bg="teal.500">
              <Tr>
                <Th color="white">Study</Th>
                <Th color="white">
                  {cellTypeLevel} celltypes associated with the study
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {metadata.map((meta, index) => (
                <React.Fragment key={`${meta.studyId}_${meta.nodeId}`}>
                  {index > 0 && (
                    <Tr>
                      <Td colSpan={2} p={0}>
                        <Divider borderColor="gray.300" />
                      </Td>
                    </Tr>
                  )}
                  <Tr>
                    <Td fontWeight="medium">
                      Study Id:{" "}
                      <Text as="span" color="gray.500">
                        {meta.studyReadableId}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2} flexWrap="wrap">
                        {getCellTypeData(meta).map((cellType, i) => (
                          <Badge key={i} variant="outline">
                            {cellType}
                          </Badge>
                        ))}
                      </HStack>
                    </Td>
                  </Tr>
                </React.Fragment>
              ))}
            </Tbody>
          </Table>
        </Box>
        <CellMappingBox
          metadata={filteredMetadata}
          cellTypeLevel={cellTypeLevel}
        />
      </VStack>
    </Box>
  );
};

export default CellLevelMetadata;