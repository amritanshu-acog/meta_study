import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  VStack,
  Heading,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Tooltip,
  SimpleGrid,
  IconButton,
  Button,
  Flex,
  Circle,
} from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import axios from "axios";
import SampleLevelMetadata from "./SampleLevelMetadata";
import CellLevelMetadata from "./CellLevelMetadata";
import { MappingContext } from "./MappingContext";
import PreviewMapping from './PreviewMapping'; // Ensure correct import


const StudyPoolPage = () => {
  const location = useLocation();
  const [studyPool, setStudyPool] = useState(location.state?.studyPool || []);
  const [metadata, setMetadata] = useState([]);
  const [stage, setStage] = useState(0);
  const { mappings = {} } = useContext(MappingContext); // Set default value
  const navigate = useNavigate(); // Hook to navigate


  useEffect(() => {
    async function fetchMetadata() {
      const metadataArray = await Promise.all(
        studyPool.map(async (study) => {
          try {
            const response = await axios.get(`/api/metadata`, {
              params: { pipeline_tree_node_id: study.activeNodeId },
            });
            return {
              studyId: study.id,
              studyReadableId: study.human_readable_study_id,
              nodeId: study.activeNodeId,
              data: response.data.sample_level_metadata || {},
              celltypeData: response.data.celltype_metadata || {},
            };
          } catch (error) {
            console.error(
              `Error fetching metadata for node ${study.activeNodeId}:`,
              error
            );
            return {
              studyId: study.id,
              nodeId: study.activeNodeId,
              data: {},
              celltypeData: {},
            };
          }
        })
      );
      setMetadata(metadataArray);
    }

    if (studyPool.length > 0) {
      fetchMetadata();
    }
  }, [studyPool]);

  const allColumns = [
    ...new Set(metadata.flatMap((item) => Object.keys(item.data))),
  ];

  const removeFromPool = (studyToRemove) => {
    setStudyPool((prevPool) =>
      prevPool.filter(
        (study) =>
          !(
            study.id === studyToRemove.id &&
            study.activeNodeId === studyToRemove.activeNodeId
          )
      )
    );
  };

  const renderCurrentStage = () => {
    switch (stage) {
      case 0:
        return (
          <SampleLevelMetadata metadata={metadata} allColumns={allColumns} />
        );
      case 1:
        return <CellLevelMetadata metadata={metadata} />;
      case 2:
        return <PreviewMapping />;
      default:
        return <Text>Unknown stage</Text>;
    }
  };

  // const handleSaveComparison = async () => {
  //   try {
  //     // Add logic to save the comparison (e.g., API call)
  //     // Example: await saveComparisonAPI(data);
  
  //     // Redirect to the metastudy detail page after saving
  //     navigate("/multistudy/metaStudyList");
  //   } catch (error) {
  //     console.error("Error saving comparison:", error);
  //   }
  // };

  return (
    <Box px={4} py={8}>
      <VStack spacing={8} align="start" width="full">
        <Heading>Study Pool Overview</Heading>
        <Box overflowX="auto" width="full">
          <HStack spacing={4} alignItems="flex-start">
            {studyPool.map((study) => (
              <StudyCard
                key={`${study.id}_${study.activeNodeId}`}
                study={study}
                onRemove={removeFromPool}
              />
            ))}
          </HStack>
        </Box>

        <Flex align="center" justify="space-between" width="600px">
          <StepperStep
            number={1}
            label="Enter metadata"
            isActive={stage === 0}
            isCompleted={stage > 0}
            onClick={() => setStage(0)}
          />
          <Box flex="1" height="2px" bg="gray.300" />
          <StepperStep
            number={2}
            label="Define celltype"
            isActive={stage === 1}
            isCompleted={stage > 1}
            onClick={() => setStage(1)}
          />
          <Box flex="1" height="2px" bg="gray.300" />
          <StepperStep
            number={3}
            label="Preview Mapping"
            isActive={stage === 2}
            isCompleted={stage > 2}
            onClick={() => setStage(2)}
          />
        </Flex>

        <Heading size="lg" my={4}>
          {stage === 0
            ? "Sample Level Metadata"
            : stage === 1
            ? "Cell Level Metadata"
            : "Preview Mapping"}
        </Heading>

        {renderCurrentStage()}

        <Box width="full" mt={4}>
          <Button
            colorScheme="blue"
            width="full"
            onClick={() => {
              if (stage < 2) {
                setStage((prevStage) => prevStage + 1);
              } else {
                handleSaveComparison(); // Function to handle saving
              }
            }}
          >
            {stage < 2 ? "Next Step" : "Save Comparison"}
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

const StepperStep = ({ number, label, isActive, isCompleted, onClick }) => (
  <HStack spacing={2} alignItems="center" cursor="pointer" onClick={onClick}>
    <Circle
      size="40px"
      bg={isCompleted ? "blue.500" : isActive ? "blue.100" : "gray.100"}
      color={isCompleted ? "white" : "black"}
    >
      {isCompleted ? <CheckIcon /> : number}
    </Circle>
    <Text
      fontWeight={isActive || isCompleted ? "bold" : "normal"}
      color={isActive || isCompleted ? "blue.500" : "gray.500"}
    >
      {label}
    </Text>
    <Box flex="1" height="2px" bg="gray.300" /> {/* Line separator */}
  </HStack>
);

const StudyCard = ({ study, onRemove }) => (
  <Card width="250px" borderWidth="1px" borderRadius="md">
    <CardHeader>
      <Heading size="sm">{study.title}</Heading>
      <Text fontSize="xs" fontWeight="light">
        Node ID: {study.activeNodeId}
      </Text>
    </CardHeader>
    <CardBody pt={0}>
      <HStack spacing={2} flexWrap="wrap" mb={2}>
        {study.diseases.map((disease, index) => (
          <Badge key={index} colorScheme="red" rounded="lg">
            {disease}
          </Badge>
        ))}
        {study.organisms.map((organism, index) => (
          <Badge key={index} colorScheme="green" fontSize="xs" rounded="lg">
            {organism}
          </Badge>
        ))}
      </HStack>
      <SimpleGrid columns={2} spacing={2} mb={2}>
        <InfoItem label="Publish Date" value={study.publish_date} />
        <InfoItem label="Tissues" value={study.tissues.join(", ")} />
        <InfoItem
          label="Cell Count"
          value={study.cell_count.toLocaleString()}
        />
        <InfoItem label="Sample Count" value={study.sample_count} />
        <InfoItem label="Source" value={study.source} />
      </SimpleGrid>
      <Tooltip label="Remove from Pool" placement="top">
        <IconButton
          aria-label="Remove from Pool"
          icon={<CloseIcon />}
          size="sm"
          colorScheme="red"
          variant="outline"
          onClick={() => onRemove(study)}
        />
      </Tooltip>
    </CardBody>
  </Card>
);

const InfoItem = ({ label, value }) => (
  <Box>
    <Text fontSize="xs" fontWeight="bold">
      {label}:
    </Text>
    <Text fontSize="sm">{value}</Text>
  </Box>
);

export default StudyPoolPage;
