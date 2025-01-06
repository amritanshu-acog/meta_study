import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heading,
  HStack,
  VStack,
  Button,
  Box,
  Container,
  Flex,
  Grid,
} from "@chakra-ui/react";
import axios from "axios";
import Loader from "../../Loader";
import Error from "../../Error";
import StudyCard from "./StudyCard";
import StudyPool from "./StudyPool"; // Import the new component
import { getStudyData } from "./utils";

const AllStudiesMain = () => {
  const [allStudies, setAllStudies] = useState([]);
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [studyPool, setStudyPool] = useState([]); // State for the study pool
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const [activeNodeOptions, setActiveNodeOptions] = useState(null); // To store active node options temporarily
  const navigate = useNavigate(); // Hook to navigate

  useEffect(() => {
    async function getAllStudies() {
      try {
        const allDiseases = await getAllDiseases();
        // Fetch all studies concurrently
        const studies = await Promise.all(
          allDiseases.map((disease) => getDiseaseStudy(disease))
        );
        setAllStudies(studies.flat());
      } catch (error) {
        setError("Failed to get All Studies");
      } finally {
        setLoading(false);
      }
    }
    async function getAllDiseases() {
      const apiUrl = "/api/study-filters";
      try {
        const res = await axios.get(apiUrl);
        const data = res.data;
        return data.disease;
      } catch (error) {
        setError("Failed to fetch All Diseases");
      }
    }
    async function getDiseaseStudy(diseaseName) {
      const apiUrl = `/api/studies?disease=${diseaseName}`;
      try {
        const res = await axios.get(apiUrl);
        const studyData = res.data[0];
        return studyData;
      } catch (error) {
        setError(`Failed to get Study for disease ${diseaseName}`);
      }
    }

    getAllStudies();
  }, []);

  console.log(allStudies);

  // Mapping of filter keys to study data keys
  const keyMapping = {
    disease: "diseases",
    tissue: "tissues",
    organism: "organisms",
    source: "source", // This key is consistent
    assay_type: "assay_type", // Assuming the study has an "assay_type" key
  };

  useEffect(() => {
    // Filter studies based on query params
    const filters = Object.fromEntries(searchParams.entries());
    let newFilteredStudies = allStudies;

    if (filters) {
      newFilteredStudies = allStudies.filter((study) => {
        return Object.entries(filters).every(([filterKey, filterValue]) => {
          const studyKey = keyMapping[filterKey]; // Get the corresponding study key
          if (!studyKey || !study[studyKey]) return false; // Skip if mapping is invalid or data is missing

          const selectedValues = searchParams.getAll(filterKey);

          if (Array.isArray(study[studyKey])) {
            // Check if any of the selected values match the study's array values
            return selectedValues.some((val) => study[studyKey].includes(val));
          }

          // Check if any of the selected values match the study's single value
          return selectedValues.includes(study[studyKey]);
        });
      });
    }

    setFilteredStudies(newFilteredStudies);
  }, [searchParams, allStudies]);

  const addToPool = (study, nodeId) => {
    const studyWithNode = {
      ...study,
      activeNodeId: nodeId,
    };

    setStudyPool((prevPool) => {
      if (
        !prevPool.some((s) => s.id === study.id && s.activeNodeId === nodeId)
      ) {
        return [...prevPool, studyWithNode];
      }
      return prevPool;
    });
  };

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

  const handleProceed = () => {
    navigate("/multistudy/studypool", { state: { studyPool } }); // Pass the state
  };
  const handleClick = () => {
    navigate('/multistudy/explorer');
};

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error errorMessage={error} />;
  }

  return (
    <Box maxW="100%" py={8} px={4} pb={16}>
      <VStack spacing={8} align="start" width="full">
        <Box
          position="sticky"
          top="0"
          zIndex="sticky"
          bg="white"
          py={4}
          width="full"
          maxHeight="calc(100vh - 2rem)"
          overflowY="auto"
        >
          <Heading mb={4}>Explore Studies</Heading>
          <Button onClick={handleClick}>Explore</Button>
          <StudyPool
            studies={studyPool}
            onProceed={handleProceed}
            removeFromPool={removeFromPool}
          />
        </Box>
        <StudyCardsContainer studies={filteredStudies} addToPool={addToPool} />
      </VStack>
    </Box>
  );
};

function StudyCardsContainer({ studies, addToPool }) {
  return (
    <Grid
      templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
      gap={4}
      width="full"
    >
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} addToPool={addToPool} />
      ))}
    </Grid>
  );
}

export default AllStudiesMain;
