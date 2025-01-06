import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Flex,
  FormControl,
  FormLabel,
  Slider,
  SliderMark,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Select as ChakraSelect,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";
import EnrichmentAnalysisMain from "../../components/EnrichmentAnalysis/EnrichmentAnalysisMain";
import EnrichmentFilter from "../../components/EnrichmentAnalysis/EnrichmentFilter";
import HourglassLoader from "../../loader/EnrichmentHourGlass";

const EnrichmentAnalysis = () => {
  const [filters, setFilters] = useState({
    // geneSet: "",
    // cutoff: 0.05,
    significanceThreshold: 1,
    foldChangeThreshold: 1,
  });

  const [cutoff, setcutoff] = useState(0.05);
  const [geneSet, setgeneSet] = useState("KEGG_2021_Human");
  const [geneSets, setGeneSets] = useState([]);
  const [results, setResults] = useState(null); // To store enrichment input
  const [allResults, setAllResults] = useState(null); // To store enrichment Data
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudy, setCurrentStudy] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  const [fetchedData, setFetchedData] = useState(null); // Store fetched data

  

  // Handle receiving data from the child component (EnrichmentFilter)
  const handleDataReceived = (data) => {
    setFetchedData(data); // Save the fetched data in parent state
    console.log("Received Data in Parent:", data); // Log received data
  };

  useEffect(() => {
    const fetchGeneSets = async () => {
      try {
        const res = await fetch(
          "https://scverse-api-dev-stable.own4.aganitha.ai:8443/ea/filters"
        );
        const data = await res.json();
        setGeneSets(data.gene_sets || []);
      } catch (err) {
        console.error("Error fetching gene sets:", err);
      }
    };

    fetchGeneSets();
  }, []);

  // This function will be passed to EnrichmentFilter to update filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const performEnrichmentAnalysis = async () => {
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Directly use fetchedData for enrichment analysis
    const results = fetchedData.reduce((acc, studyData) => {
      const {
        human_readable_study_id,
        upregulated_genes,
        downregulated_genes,
      } = studyData;
      acc[human_readable_study_id] = {
        upregulatedGenes: upregulated_genes,
        downregulatedGenes: downregulated_genes,
      };
      return acc;
    }, {});

    const fetchEnrichmentForStudy = async (studyData, studyName) => {
      setCurrentStudy(studyName);
      const upregulated = studyData.upregulatedGenes;
      const downregulated = studyData.downregulatedGenes;

      const requestData = {
        upregulated: [...new Set(upregulated)],
        downregulated: [...new Set(downregulated)],
        cutoff: cutoff,
        gene_set: geneSet,
      };

      try {
        const response = await fetch(
          "https://scverse-api-dev-stable.own4.aganitha.ai:8443/ea/apply-enrichment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestData),
          }
        );

        const data = await response.json();
        console.log("Enrichment result for study:", studyName, data);
        return { study: studyName, data };
      } catch (error) {
        console.error(
          `Error fetching enrichment data for ${studyName}:`,
          error
        );
        return { study: studyName, error: "Error occurred" };
      }
    };

    const startTime = performance.now();
    const allResults = [];

    // Process each study sequentially
    for (const [studyName, studyData] of Object.entries(results)) {
      console.log(`Starting enrichment analysis for study: ${studyName}`);
      const result = await fetchEnrichmentForStudy(studyData, studyName);
      allResults.push(result);
      await sleep(100);
    }

    const endTime = performance.now();
    console.log(
      `Total time for enrichment analysis: ${(endTime - startTime).toFixed(
        2
      )} ms`
    );
    setCurrentStudy("");
    setAllResults(allResults);
    console.log("All results", allResults);
    setIsLoading(false);
  };

  useEffect(() => {
    if (fetchedData) {
      // This will trigger the enrichment analysis when the component first mounts
      setIsLoading(true);
      performEnrichmentAnalysis();
    }
  }, [fetchedData]); // Trigger when fetchedData is available
  
  const handleApplyFilters = () => {
    console.log("Filters Applied!");
    setFiltersApplied(true); // Marks that filters have been applied
  };
  
  useEffect(() => {
    if (filtersApplied) {
      // Trigger enrichment analysis again when filters are applied
      setIsLoading(true);
      performEnrichmentAnalysis();
      setFiltersApplied(false); // Reset the filtersApplied flag after performing the analysis
    }
  }, [filtersApplied]); // This will trigger the analysis when filtersApplied is true
  
  
  
  return (
    <Flex height="100vh" width="100%">
      {/* Sidebar */}
      <Box
        w="20%" // Sidebar width as a percentage of the total layout
        minW="200px" // Ensure a minimum width
        maxW="250px" // Cap the maximum width for consistenc
        display="flex"
        flexDirection="column" // Stack items vertically in the sidebar
      >
        <EnrichmentFilter
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          onDataReceived={handleDataReceived}
        />
      </Box>

      <Box
        flex="2"
        borderLeft="1px solid #ddd"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        {/* Filters Section */}
        <Flex
          p={4}
          bg="#f5f5f5"
          direction="row" // Arrange items side by side
          borderRadius="12px"
          justify="space-between"
          alignItems="end"
          boxShadow="sm"
          w="50%"
          gap={4}
          maxW="100vw"
          m={4}
        >
          {/* Cutoff Slider */}
          <FormControl w="48%">
            {" "}
            {/* Adjust width to take half of the space */}
            <FormLabel fontWeight="bold" color="gray.700">
              <span className="">Cutoff (AdjPVal):</span>
            </FormLabel>
            <Slider
              min={0.0}
              max={0.1}
              step={0.01}
              value={cutoff}
              onChange={(v) => setcutoff(v)}
            >
              <SliderMark value={cutoff} mt="1" ml="-2.5" fontSize="xs">
                {cutoff.toFixed(2)}
              </SliderMark>
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>

          {/* Gene Set Dropdown */}
          <FormControl w="48%">
            {" "}
            {/* Adjust width to take half of the space */}
            <FormLabel fontWeight="bold" color="gray.700">
              <span className="">Gene Set:</span>
            </FormLabel>
            <ChakraSelect
              bg="white"
              borderColor="#B3B3B3"
              fontSize="sm"
              value={geneSet}
              onChange={(e) => setgeneSet(e.target.value)}
              placeholder="Select Gene Set"
            >
              {geneSets.map((geneSet, index) => (
                <option value={geneSet} key={index}>
                  {geneSet}
                </option>
              ))}
            </ChakraSelect>
          </FormControl>

          <Button
            colorScheme="blue"
            onClick={handleApplyFilters}
            ml={4} // Add some margin for spacing
            size="sm"
            fontWeight="bold"
          >
            Apply Filters
          </Button>
        </Flex>

        {/* Message for Missing Filters */}
        {(!filters.significanceThreshold || !filters.foldChangeThreshold) &&
        filtersApplied ? (
          <Alert
            status="info" // Set alert type (info, warning, success, error)
            variant="subtle" // Subtle variant for a softer background
            flexDirection="row"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            borderRadius="8px"
            mt={4}
            mb={6}
            w="60%"
          >
            <AlertIcon />
            <AlertDescription fontSize="md">
              Select all required filters to perform the analysis.
            </AlertDescription>
          </Alert>
        ) : null}

        {/* Enrichment Analysis Results */}
        <Box w="100%" mt="0" bg="white" borderRadius="8px" boxShadow="sm">
          {isLoading ? (
            <HourglassLoader currentStudy={currentStudy} />
          ) : (
            allResults && (
              <EnrichmentAnalysisMain
                data={allResults}
                enrichmentInput={results}
              />
            )
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default EnrichmentAnalysis;
