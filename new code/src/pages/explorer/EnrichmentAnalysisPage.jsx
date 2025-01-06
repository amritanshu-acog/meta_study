import React, { useState, useEffect } from "react";
import {
  Box,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import EnrichmentFilter from "../../components/explorer/enrichment-analysis/EnrichmentFilter";
import EnrichmentAnalysisMain from "../../components/explorer/enrichment-analysis/EnrichmentAnalysisMain";
import EnrichmentInputTable from "../../components/explorer/enrichment-analysis/EnrichmentInputTable";
import { useStudyNode } from "./StudyNodeContext";

const EnrichmentAnalysisPage = ({ activeComponent, setActiveComponent }) => {
  const { breadcrumbElement } = useStudyNode();
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [enrichmentInput, setEnrichmentInput] = useState(null);
  const [cutoff, setCutoff] = useState(0.05);
  const [geneSet, setGeneSet] = useState("GO_Biological_Process_2023");

  const applyFilters = async () => {
    if (!enrichmentInput) return;

    // Generate a unique cache key based on input data and filters
    const cacheKey = JSON.stringify({
      upregulated: enrichmentInput.upregulated.map((data) => data.gene),
      downregulated: enrichmentInput.downregulated.map((data) => data.gene),
      cutoff,
      geneSet,
    });

    // Check if data is already cached
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      setEnrichmentData(JSON.parse(cachedData));
      return; // Exit early if data is already found in the cache
    }

    // Clear old caches
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith("enrichmentInput")) {
        // Use a consistent prefix if applicable
        sessionStorage.removeItem(key);
      }
    });

    setEnrichmentData(null);
    const requestData = {
      upregulated: enrichmentInput.upregulated.map(
        (data) => data.gene || data.Gene
      ),
      downregulated: enrichmentInput.downregulated.map(
        (data) => data.gene || data.Gene
      ),
      cutoff,
      gene_set: geneSet,
    };

    try {
      const response = await fetch("/api/ea/apply-enrichment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      const data = await response.json();
      setEnrichmentData(data);

      // Cache the fetched data
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error("Error fetching enrichment data:", error);
    }
  };

  useEffect(() => {
    // Retrieve the enrichmentInput from local storage
    const storedEnrichmentInput = sessionStorage.getItem("enrichmentInput");
    if (storedEnrichmentInput) {
      setEnrichmentInput(JSON.parse(storedEnrichmentInput));
    }
  }, [activeComponent === "enrichmentAnalysis"]);

  useEffect(() => {
    // Call applyFilters whenever enrichmentInput changes and is valid
    if (enrichmentInput) {
      applyFilters();
    }
  }, [enrichmentInput]);

  return (
    <>
      <Box display="flex" p={0} px={0} className="h-screen">
        <EnrichmentFilter
          cutoff={cutoff}
          setCutoff={setCutoff}
          geneSet={geneSet}
          setGeneSet={setGeneSet}
          applyFilters={applyFilters}
        />
        <Box width="85%" overflow="visible" height="max-content">
          {breadcrumbElement}
          <Box padding="10px 20px">
            {enrichmentInput && (
              <Accordion
                allowToggle
                mt={4}
                bg="white"
                border="1px solid #B3B3B3"
                borderRadius="20px"
                width="fit-content"
                maxWidth="100%"
              >
                <AccordionItem border="none" maxWidth="100%">
                  <AccordionButton borderRadius="20px">
                    <Box flex="1" textAlign="left" fontWeight="bold">
                      Enrichment Input Data &#40; Source{" "}
                      <span className="text-[var(--primary-color)]">
                        {enrichmentInput.source.toUpperCase()}
                      </span>{" "}
                      &#41;
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel pb={4}>
                    {enrichmentInput && (
                      <EnrichmentInputTable data={enrichmentInput} />
                    )}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            )}
            {enrichmentInput ? (
              enrichmentData ? (
                <EnrichmentAnalysisMain data={enrichmentData} />
              ) : (
                <h1 style={{ margin: "20px" }}>Loading Plot...</h1>
              )
            ) : (
              <h1>
                No Data available. Push result from{" "}
                <span
                  style={{
                    color: "blue",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setActiveComponent("umap");
                  }}
                >
                  UMAPS
                </span>{" "}
                or{" "}
                <span
                  style={{
                    color: "blue",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setActiveComponent("dgeAnalysis");
                  }}
                >
                  DGE Analysis
                </span>{" "}
                to get started.
              </h1>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default EnrichmentAnalysisPage;
