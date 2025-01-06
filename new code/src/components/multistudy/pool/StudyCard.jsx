import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heading,
  HStack,
  VStack,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  SimpleGrid,
  Divider,
  Text,
  IconButton,
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Select,
} from "@chakra-ui/react";
import {
  Calendar,
  FlaskRoundIcon as Flask,
  Users,
  Database,
  WormIcon as Virus,
  PlusCircle,
} from "lucide-react";
import { getStudyData } from "./utils"; // Ensure the path matches your file structure

const StudyCard = ({ study, addToPool }) => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeNodes, setActiveNodes] = useState([]);
  const [selectedNodeId, setSelectedNodeId] = useState("");

  const InfoItem = ({ icon: Icon, label, value }) => (
    <VStack spacing={1} align="center">
      <Icon size={16} />
      <Text fontSize="xs" fontWeight="bold" textAlign="center">
        {label}
      </Text>
      <Text fontSize="sm" textAlign="center">
        {value}
      </Text>
    </VStack>
  );

  useEffect(() => {
    if (isOpen) {
      getStudyData(study.id, () => {}, setActiveNodes);
    }
  }, [isOpen, study.id]); // Fetch nodes once modal opens.

  useEffect(() => {
    // Set the first node as default when activeNodes are set
    if (activeNodes.length > 0) {
      setSelectedNodeId(activeNodes[0].node_id);
    }
  }, [activeNodes]);

  const handleAddToPoolClick = () => {
    onOpen(); // Open modal after fetching nodes
  };

  const handleNodeSelection = (event) => {
    setSelectedNodeId(event.target.value);
  };

  const handleConfirmAdd = () => {
    if (selectedNodeId) {
      addToPool(study, selectedNodeId);
    }
    onClose();
  };

  return (
    <Card
      minW={{ base: "100%", lg: "370px" }}
      maxW="370px"
      borderRadius="lg"
      boxShadow="md"
    >
      <CardHeader>
        <Heading size="sm" mb={2} fontWeight="semibold">
          {study.title}
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
      </CardHeader>
      <CardBody>
        <Divider mb={4} />
        <SimpleGrid columns={[2, 3]} spacing={4}>
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
      </CardBody>
      <CardFooter>
        <HStack width="full" spacing={2}>
          <Button
            colorScheme="blue"
            flex={1}
            onClick={() => navigate(`/study/${study.id}`)}
          >
            Load Study
          </Button>
          <Tooltip label="Add to Pool" placement="top">
            <IconButton
              aria-label="Add to Pool"
              icon={<PlusCircle />}
              colorScheme="green"
              onClick={handleAddToPoolClick}
            />
          </Tooltip>
        </HStack>
      </CardFooter>

      {/* Modal for selecting active node */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Active Node</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Select onChange={handleNodeSelection} value={selectedNodeId}>
              {Array.isArray(activeNodes) &&
                activeNodes.map((node) => (
                  <option key={node.node_id} value={node.node_id}>
                    {node.node_id || node.node_id}{" "}
                    {/* Fallback to node_id if node_name is unavailable */}
                  </option>
                ))}
            </Select>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleConfirmAdd}>
              Add to Pool
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Card>
  );
};

export default StudyCard;
