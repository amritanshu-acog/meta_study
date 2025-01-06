import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Button,
  VStack,
  Heading,
  Text,
  HStack,
  Badge,
  IconButton,
  Tooltip,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  X,
  Calendar,
  FlaskRoundIcon as Flask,
  Users,
  Database,
  WormIcon as Virus,
} from "lucide-react";

const StudyPool = ({ studies=[], onProceed, removeFromPool }) => {
  const maxHeight = useBreakpointValue({
    base: "300px",
    md: "400px",
    lg: "500px",
  });

  return (
    <Accordion allowToggle defaultIndex={[0]} width="full">
      <AccordionItem>
        <AccordionButton>
          <Box flex="1" textAlign="left">
            <Heading size="md">Study Pool ({studies.length})</Heading>
          </Box>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel pb={4} maxHeight={maxHeight} overflowY="auto">
          <VStack spacing={3} align="stretch">
            {studies.map((study) => (
              <StudyPoolItem
                key={`${study.id}_${study.activeNodeId}`}
                study={study}
                onRemove={() => removeFromPool(study)}
              />
            ))}
          </VStack>
          {studies.length > 0 && (
            <Button colorScheme="blue" mt={4} onClick={onProceed} width="full">
              Proceed with {studies.length}{" "}
              {studies.length === 1 ? "Study" : "Studies"}
            </Button>
          )}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <HStack spacing={2} align="center">
    <Icon size={16} />
    <Text fontSize="xs" fontWeight="bold">
      {label}:
    </Text>
    <Text fontSize="sm">{value}</Text>
  </HStack>
);

const StudyPoolItem = ({ study, onRemove }) => (
  <Box p={3} borderWidth="1px" borderRadius="md" position="relative">
    <HStack justifyContent="space-between" alignItems="flex-start">
      <VStack align="start" spacing={2} width="full">
        <Heading size="sm">
          {study.title}{" "}
          <Text fontSize="xs" fontWeight="light" mt="2">
            Node ID: {study.activeNodeId}
          </Text>
        </Heading>
        <HStack spacing={2} flexWrap="wrap">
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
        <SimpleGrid columns={[2, 3]} spacing={2} width="full">
          <InfoItem
            icon={Calendar}
            label="Publish Date"
            value={study.publish_date}
          />
          <InfoItem
            icon={Flask}
            label="Tissues"
            value={study.tissues.join(", ")}
          />
          <InfoItem
            icon={Virus}
            label="Cell Count"
            value={study.cell_count.toLocaleString()}
          />
          <InfoItem
            icon={Users}
            label="Sample Count"
            value={study.sample_count}
          />
          <InfoItem icon={Database} label="Source" value={study.source} />
        </SimpleGrid>
      </VStack>
      <Tooltip label="Remove from Pool" placement="top">
        <IconButton
          aria-label="Remove from Pool"
          icon={<X size={16} />}
          size="sm"
          colorScheme="red"
          variant="ghost"
          onClick={() => onRemove(study)} // Pass the full study object for removal
        />
      </Tooltip>
    </HStack>
  </Box>
);

export default StudyPool;
