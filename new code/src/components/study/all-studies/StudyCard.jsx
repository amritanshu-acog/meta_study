import React from "react";
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
} from "@chakra-ui/react";

import {
  FaCalendarAlt,
  FaFlask,
  FaUsers,
  FaDatabase,
  FaDisease,
} from "react-icons/fa";

const StudyCard = ({ study }) => {
  const navigate = useNavigate();
  const InfoItem = ({ icon: Icon, label, value }) => (
    <VStack spacing={1} align="center">
      <Icon size="16px" />
      <Text fontSize="xs" fontWeight="bold" textAlign="center">
        {label}
      </Text>
      <Text fontSize="sm" textAlign="center">
        {value}
      </Text>
    </VStack>
  );

  return (
    <Card
      minW={{ base: "100%", lg: "370px" }} // Dynamic minWidth based on screen size
      maxW="370px"
      borderRadius="lg"
      boxShadow="md"
    >
      <CardHeader>
        <Heading size="sm" mb={2}>
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
            icon={FaCalendarAlt}
            label="Publish Date"
            value={study.publish_date}
          />
          <InfoItem
            icon={FaFlask}
            label="Tissues"
            value={study.tissues.join(", ")}
          />
          <InfoItem
            icon={FaDisease}
            label="Cell Count"
            value={study.cell_count.toLocaleString()}
          />
          <InfoItem
            icon={FaUsers}
            label="Sample Count"
            value={study.sample_count}
          />
          <InfoItem icon={FaDatabase} label="Source" value={study.source} />
        </SimpleGrid>
      </CardBody>
      <CardFooter>
        <Button
          colorScheme="blue"
          width="full"
          onClick={() => navigate(`/study/${study.id}`)}
        >
          Load Study
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StudyCard;
