import React, { useState, useContext } from "react";
import {
  Box,
  Table,
  Tbody,
  Tr,
  Td,
  Th,
  Thead,
  Text,
  Badge,
  Select,
  Button,
  VStack,
  HStack,
} from "@chakra-ui/react";
import { useDrop, useDrag } from "react-dnd";
import { MappingContext } from "./MappingContext"; // Adjust the import path

const ItemTypes = {
  CHIP: "chip",
};

const MappingTable = ({ metadata, comparatorMap, comparator }) => {
  const [selectedMetadata, setSelectedMetadata] = useState(
    metadata.reduce((acc, meta) => {
      acc[meta.studyId] = Object.keys(meta.data)[0];
      return acc;
    }, {})
  );

  const [comparatorMappings, setComparatorMappings] = useState(
    Object.keys(comparatorMap).reduce((acc, comp) => {
      acc[comp] = metadata.reduce((metaAcc, meta) => {
        metaAcc[meta.studyId] = Object.keys(meta.data).reduce(
          (typeAcc, type) => {
            typeAcc[type] = {
              unmapped: [...meta.data[type]],
              ...comparatorMap[comp].reduce((mapperAcc, mapper) => {
                mapperAcc[mapper] = [];
                return mapperAcc;
              }, {}),
            };
            return typeAcc;
          },
          {}
        );
        return metaAcc;
      }, {});
      return acc;
    }, {})
  );

  const [isLocked, setIsLocked] = useState(false);
  const { saveSampleLevelMapping } = useContext(MappingContext); // Get function to save mappings

  const handleMetadataChange = (studyId, field) => {
    setSelectedMetadata({
      ...selectedMetadata,
      [studyId]: field,
    });
  };

  const handleDrop = (item, targetStudyId, targetMapper, targetField) => {
    const { value, sourceRow, sourceField, sourceMapper } = item;
    if (sourceRow !== targetStudyId || isLocked) return;

    setComparatorMappings((prev) => {
      const updated = { ...prev };

      if (sourceMapper === "unmapped") {
        updated[comparator][sourceRow][sourceField].unmapped = updated[
          comparator
        ][sourceRow][sourceField].unmapped.filter((v) => v !== value);
      } else {
        updated[comparator][sourceRow][sourceField][sourceMapper] = updated[
          comparator
        ][sourceRow][sourceField][sourceMapper].filter((v) => v !== value);
      }

      if (targetMapper === "unmapped") {
        updated[comparator][targetStudyId][targetField].unmapped.push(value);
      } else {
        updated[comparator][targetStudyId][targetField][targetMapper].push(
          value
        );
      }

      return updated;
    });
  };

  const consolidateMappingData = () => {
    return Object.keys(comparatorMappings).reduce((result, comp) => {
      result[comp] = comparatorMappings[comp];
      return result;
    }, {});
  };

  const handleSave = () => {
    const dataToSend = consolidateMappingData();
    saveSampleLevelMapping(dataToSend); // Store data in context
    console.log("Data ready to send:", dataToSend);
    setIsLocked(true);
  };

  const handleReset = () => {
    setComparatorMappings((prev) =>
      Object.keys(prev).reduce((acc, comp) => {
        acc[comp] = metadata.reduce((metaAcc, meta) => {
          metaAcc[meta.studyId] = Object.keys(meta.data).reduce(
            (typeAcc, type) => {
              typeAcc[type] = {
                unmapped: [...meta.data[type]],
                ...comparatorMap[comp].reduce((mapperAcc, mapper) => {
                  mapperAcc[mapper] = [];
                  return mapperAcc;
                }, {}),
              };
              return typeAcc;
            },
            {}
          );
          return metaAcc;
        }, {});
        return acc;
      }, {})
    );
    setIsLocked(false);
  };

  return (
    <Box borderWidth={1} borderRadius="md" overflow="hidden" mt={4}>
      <Text fontWeight="bold" mb={2}>
        Drag and drop from unmapped values:
      </Text>
      <Table variant="simple" size="sm">
        <Thead>
          <Tr>
            <Th>Study & Pipeline</Th>
            <Th>Select Metadata</Th>
            {comparatorMap[comparator].map((mapper) => (
              <Th key={mapper} px={4}>
                {mapper}
              </Th>
            ))}
            <Th px={4}>Unmapped values</Th>
          </Tr>
        </Thead>
        <Tbody>
          {metadata.map((meta) => {
            const dropRefs = {};

            comparatorMap[comparator].forEach((mapper) => {
              dropRefs[mapper] = useDrop({
                accept: ItemTypes.CHIP,
                drop: (item) =>
                  handleDrop(
                    item,
                    meta.studyId,
                    mapper,
                    selectedMetadata[meta.studyId]
                  ),
                canDrop: (item) => item.sourceRow === meta.studyId && !isLocked,
              })[1];
            });

            const unmappedRef = useDrop({
              accept: ItemTypes.CHIP,
              drop: (item) =>
                handleDrop(
                  item,
                  meta.studyId,
                  "unmapped",
                  selectedMetadata[meta.studyId]
                ),
              canDrop: (item) => item.sourceRow === meta.studyId && !isLocked,
            })[1];

            return (
              <Tr key={meta.studyId}>
                <Td>
                  <Text fontWeight="bold">{meta.studyReadableId}</Text>
                  <Text fontSize="sm" color="gray.500">
                    Node: {meta.nodeId}
                  </Text>
                </Td>
                <Td>
                  <Select
                    value={selectedMetadata[meta.studyId]}
                    onChange={(e) =>
                      handleMetadataChange(meta.studyId, e.target.value)
                    }
                    isDisabled={isLocked}
                  >
                    {Object.keys(meta.data).map((field) => (
                      <option key={field} value={field}>
                        {field}
                      </option>
                    ))}
                  </Select>
                </Td>
                {comparatorMap[comparator].map((mapper) => (
                  <Td key={mapper} ref={dropRefs[mapper]} py={2} px={4}>
                    {(
                      comparatorMappings[comparator][meta.studyId][
                        selectedMetadata[meta.studyId]
                      ][mapper] || []
                    ).map((value, idx) => (
                      <DraggableChip
                        key={idx}
                        value={value}
                        studyId={meta.studyId}
                        field={selectedMetadata[meta.studyId]}
                        sourceMapper={mapper}
                      />
                    ))}
                  </Td>
                ))}
                <Td ref={unmappedRef} py={2} px={4}>
                  {(
                    comparatorMappings[comparator][meta.studyId][
                      selectedMetadata[meta.studyId]
                    ].unmapped || []
                  ).map((value, index) => (
                    <DraggableChip
                      key={index}
                      value={value}
                      studyId={meta.studyId}
                      field={selectedMetadata[meta.studyId]}
                      sourceMapper="unmapped"
                    />
                  ))}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
      <HStack spacing={4} mt={4}>
        <Button colorScheme="blue" onClick={handleSave} isDisabled={isLocked}>
          Save
        </Button>
        <Button colorScheme="red" onClick={handleReset} isDisabled={!isLocked}>
          Reset
        </Button>
      </HStack>
    </Box>
  );
};

const DraggableChip = ({ value, studyId, field, sourceMapper }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CHIP,
    item: { value, sourceRow: studyId, sourceField: field, sourceMapper },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  });

  return (
    <Badge
      ref={drag}
      bg={isDragging ? "gray.300" : "gray.200"}
      variant="outline"
      cursor={isDragging ? "grabbing" : "grab"}
      py={1}
      px={2}
      mb={1}
      display="block"
      mx={1}
    >
      {value}
    </Badge>
  );
};

export default MappingTable;
