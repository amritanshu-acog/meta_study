import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Heading, HStack } from "@chakra-ui/react";
import axios from "axios";
import Loader from "../../Loader";
import Error from "../../Error";
import StudyCard from "./StudyCard";

const AllStudiesMain = () => {
  const [allStudies, setAllStudies] = useState([]);
  const [filteredStudies, setFilteredStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();

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

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error errorMessage={error} />;
  }

  return (
    <div>
      <Heading>Explore Studies</Heading>
      <StudyCardsContainer studies={filteredStudies} />
    </div>
  );
};

function StudyCardsContainer({ studies }) {
  return (
    <HStack marginBlock="2rem" flexWrap="wrap" gap="2">
      {studies.map((study) => (
        <StudyCard key={study.id} study={study} />
      ))}
    </HStack>
  );
}

export default AllStudiesMain;
