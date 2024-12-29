import React, { useState } from "react";
import { Box } from "@chakra-ui/react";
import EnrichmentAnalysisFilter from "./EnrichmentAnalysisFilter";
import EnrichmentAnalysisMain from "./EnrichmentAnalysisMain";
import Loader from "../../../loader/Loader";

const EnrichmentAnalysisPage = ({ enrichmentInput }) => {
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [cutoff, setCutoff] = useState(0.05);
  const [geneSet, setGeneSet] = useState("KEGG_2021_Human");
  const [loading, setLoading] = useState(false); // Track loading state

  const applyFilters = async () => {
    if (!enrichmentInput) return;
    setEnrichmentData(null);
    setLoading(true); // Start loading

    const requestData = {
      upregulated: enrichmentInput.upregulated.map((data) => data.gene),
      downregulated: enrichmentInput.downregulated.map((data) => data.gene),
      cutoff,
      gene_set: geneSet,
    };

    console.log("request", requestData);

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
      setEnrichmentData(data);
    } catch (error) {
      console.error("Error fetching enrichment data:", error);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        height="100%"
        overflow="hidden"
      >
        {/* Enrichment Analysis Filter Section */}
        <Box
          display="flex"
          justifyContent="center" // Horizontally center the filter section
          width="100%"
          p="20px"
          mb="20px"
          boxShadow="sm"
        >
          <EnrichmentAnalysisFilter
            cutoff={cutoff}
            setCutoff={setCutoff}
            geneSet={geneSet}
            setGeneSet={setGeneSet}
            applyFilters={applyFilters}
          />
        </Box>

        {/* Main Content Section */}
        <Box flex="1" overflow="auto" ml="20px" mb="100px">
          {enrichmentInput ? (
            loading ? (
              <Loader /> // Replace text with Loader component
            ) : enrichmentData ? (
              <EnrichmentAnalysisMain
                data={enrichmentData}
                enrichmentInput={enrichmentInput}
              />
            ) : (
              <h1>Select Filters to do enrichment</h1> // Default message before applying filters
            )
          ) : (
            <h1>No Enrichment Input Available</h1>
          )}
        </Box>
      </Box>
    </>
  );
};

export default EnrichmentAnalysisPage;
