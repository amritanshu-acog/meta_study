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
  const [allStudiesData, setAllStudiesData] = useState({});
  const [results, setResults] = useState(null); // To store enrichment input
  const [allResults, setAllResults] = useState(null); // To store enrichment Data
  const [isLoading, setIsLoading] = useState(false);
  const [currentStudy, setCurrentStudy] = useState("");
  const [filtersApplied, setFiltersApplied] = useState(false);

  // Handle Apply Filters
  const handleApplyFilters = () => {
    setFiltersApplied(true);
  };

  useEffect(() => {
    const fetchGeneSets = async () => {
      try {
        const res = await fetch(
          "https://scverse-api-dev-stable2.own4.aganitha.ai:8443/ea/filters"
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

  // Study files
  const studyFiles = [
    "JD-32-178.json",
    "KD-32-165.json",
    "MP-39-115.json",
    "SLE-32-234.json",
  ];

  // Format study names
  const formatStudyName = (filename) =>
    filename.replace(".json", "").toUpperCase();

  // Fetch all studies
  const fetchAllStudies = async () => {
    const fetchedData = {};

    for (const filename of studyFiles) {
      const study = formatStudyName(filename);

      try {
        const response = await fetch(`/studies/${filename}`);
        const data = await response.json();

        const { gene, pvalue, log2FoldChange, padj, baseMean } = data;

        if (
          gene.length === pvalue.length &&
          gene.length === log2FoldChange.length
        ) {
          const studyData = gene.map((geneName, index) => ({
            gene: geneName,
            pvalue: pvalue[index],
            log2FoldChange: log2FoldChange[index],
            negativeLog10PValue: -Math.log10(pvalue[index]),
            study: study,
            baseMean: baseMean[index],
            padj: padj[index],
          }));

          fetchedData[study] = studyData;
        } else {
          console.error(`Data arrays have unequal lengths for study: ${study}`);
        }
      } catch (error) {
        console.error(`Error fetching study ${study}:`, error);
      }
    }

    return fetchedData;
  };

  // Fetch and set all studies data
  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchAllStudies();
      setAllStudiesData(data);
    };

    fetchData();
  }, []);

  const performEnrichmentAnalysis = async (results) => {
    // Sleep function to create a delay
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const fetchEnrichmentForStudy = async (studyData, studyName) => {
      setCurrentStudy(studyName);
      // Extract only gene names from upregulatedGenes and downregulatedGenes
      const upregulated = studyData.upregulatedGenes.map((gene) => gene.gene);
      const downregulated = studyData.downregulatedGenes.map(
        (gene) => gene.gene
      );

      const requestData = {
        upregulated: [...new Set(upregulated)], // Unique gene names
        downregulated: [...new Set(downregulated)], // Unique gene names
        cutoff: cutoff, // Include the cutoff
        gene_set: geneSet, // Include the gene set
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
        return { study: studyName, data }; // Return the study name and its enrichment data
      } catch (error) {
        console.error(
          `Error fetching enrichment data for ${studyName}:`,
          error
        );
        return { study: studyName, error: "Error occurred" };
      }
    };

    const startTime = performance.now();

    // Process each study sequentially
    const allResults = [];
    for (const [studyName, studyData] of Object.entries(results)) {
      // Log the study name and request data being sent
      console.log(`Starting enrichment analysis for study: ${studyName}`);
      console.log("Request Data:", {
        upregulated: studyData.upregulatedGenes.map((gene) => gene.gene),
        downregulated: studyData.downregulatedGenes.map((gene) => gene.gene),
        cutoff: cutoff,
        gene_set: geneSet,
      });

      // Fetch enrichment data for the current study
      const result = await fetchEnrichmentForStudy(studyData, studyName);
      allResults.push(result); // Store the result

      // Wait for 100ms before sending the next request
      await sleep(100);
    }

    const endTime = performance.now();
    console.log(
      `Total time for enrichment analysis: ${(endTime - startTime).toFixed(
        2
      )} ms`
    );
    // Set the final results once all studies have been processed
    setCurrentStudy("");
    setAllResults(allResults);
    setIsLoading(false);
    console.log("Enrichment Analysis Results:", allResults);
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (Object.keys(allStudiesData).length === 0) {
      console.log("No data available.");
      return;
    }

    const results = {};

    for (const [study, data] of Object.entries(allStudiesData)) {
      // Filter upregulated genes
      const upregulatedGenes = data.filter(
        (d) =>
          d.log2FoldChange >= filters.foldChangeThreshold &&
          d.negativeLog10PValue !== null && // Exclude invalid values
          d.negativeLog10PValue >= filters.significanceThreshold
      );

      // Filter downregulated genes
      const downregulatedGenes = data.filter(
        (d) =>
          d.log2FoldChange <= -filters.foldChangeThreshold &&
          d.negativeLog10PValue !== null && // Exclude invalid values
          d.negativeLog10PValue >= filters.significanceThreshold
      );

      // Store the filtered results with cutoff and gene set
      results[study] = {
        upregulatedGenes,
        downregulatedGenes,
      };
    }

    setResults(results);
    console.log("Filtered Results:", results); // enrichmentInput is results and allResults is the EnrichmentData.
    setIsLoading(true);
    await performEnrichmentAnalysis(results);
  };

  // Automatically start the analysis when filters are set
  // useEffect(() => {
  //   if (
  //     geneSet &&
  //     cutoff &&
  //     filters.significanceThreshold &&
  //     filters.foldChangeThreshold
  //   ) {
  //     handleSubmit(); // Start analysis when filters are applied
  //   }
  // }, [filters]);

  // Handle Submit Triggered Only on Apply Filters
  useEffect(() => {
    if (filtersApplied) {
      handleSubmit();
      setFiltersApplied(false); // Reset the state after applying filters
    }
  }, [filtersApplied]);


  return (
    <Flex height="100%" width="100%">
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
            size="md"
            fontWeight="bold"
          >
            Apply Filters
          </Button>
        </Flex>

        {/* Message for Missing Filters */}
        {
        (!filters.significanceThreshold || !filters.foldChangeThreshold) && filtersApplied ? (
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
