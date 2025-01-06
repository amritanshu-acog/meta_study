import React, { useState, useRef, useMemo, useEffect } from "react";
import { Box, Flex } from "@chakra-ui/react";
import Loader from "../../loader/Loader";
import DgeAnalysisMain from "../../components/DGEAnalysis/DgeAnalysisMain";
import DGEAnalysisFilter from "../../components/DGEAnalysis/DGEAnalysisFilter";
import FilterComponent from "../../components/DGEAnalysis/FilterComponent";
import debounce from "lodash/debounce";

const DgeAnalysisNew = () => {
  const [selectedBaseStudy, setSelectedBaseStudy] = useState("");
  const [filters, setFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [showPlot, setShowPlot] = useState(false);
  const lastFetchedConfig = useRef({ baseStudy: "", filters: {} });
  const [loading, setLoading] = useState(false);
  const [significanceThreshold, setSignificanceThreshold] = useState(1.0);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(1.0);
  const [geneSelection, setGeneSelection] = useState("all");
  const [allStudiesDataNew, setAllStudiesDataNew] = useState(null);
  const [studiesCache, setStudiesCache] = useState({});
  const [upregulatedData, setUpregulatedData] = useState([]);
  const [downregulatedData, setDownregulatedData] = useState([]);
  const [nonBaseStudyData, setNonBaseStudyData] = useState([]);

  const [upregulatedCount, setUpregulatedCount] = useState(0);
  const [downregulatedCount, setDownregulatedCount] = useState(0);

  const [shouldProcessData, setShouldProcessData] = useState(false);

  const [processedData, setProcessedData] = useState([]);
  const [minMaxValues, setMinMaxValues] = useState({
    minPValue: 0,
    maxPValue: 1,
    minLog2FoldChange: 0,
    maxLog2FoldChange: 1,
  });

  const [filtersNew, setFiltersNew] = useState(null);
  const [studyNames, setStudyNames] = useState([]);
  const [transformedStudyData, setTransformedStudyData] = useState({});

  

  const fetchData = async (filters) => {
    const metastudy_id = "d344c323-31ac-4c45-b932-096f3cbb238d"; // Direct metastudy ID
    const url = `https://scverse-api-dev-stable.own4.aganitha.ai:8443/${metastudy_id}/metastudy-dge/result?split_by_key=${filters.splitByKey}&comparison=${filters.comparison}&cell_type_level=${filters.cellTypeLevel}&cell_type=${filters.cellType}&shrinkage=${filters.shrinkage}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      console.log("Fetched Data:", data); // Log fetched data

      // Initialize an object to hold the transformed data
      const transformedData = {};

      // Loop through the fetched data (which contains multiple studies)
      data.forEach((studyObj) => {
        const { human_readable_study_id, data } = studyObj;
        const {
          gene,
          pvalue,
          log2FoldChange,
          padj,
          baseMean,
          negativeLog10PValue,
          pct_1,
          pct_2,
          lfcSE,
        } = data;

        // Check if the arrays have the same length
        if (
          gene.length === pvalue.length &&
          gene.length === log2FoldChange.length &&
          gene.length === padj.length &&
          gene.length === baseMean.length &&
          gene.length === negativeLog10PValue.length &&
          gene.length === pct_1.length &&
          gene.length === pct_2.length &&
          gene.length === lfcSE.length
        ) {
          // Map the data for each gene in the study
          const studyData = gene.map((geneName, index) => ({
            gene: geneName,
            pvalue: pvalue[index],
            log2FoldChange: log2FoldChange[index],
            negativeLog10PValue: negativeLog10PValue[index],
            study: human_readable_study_id,
            baseMean: baseMean[index],
            padj: padj[index],
            pct_1: pct_1[index],
            pct_2: pct_2[index],
            lfcSE: lfcSE[index],
          }));

          // Store the study data in the result object
          transformedData[human_readable_study_id] = studyData;
        } else {
          console.error(
            `Data arrays have unequal lengths for study: ${human_readable_study_id}`
          );
        }
      });

      console.log("Transformed Study Data:", transformedData);
      setStudiesCache(transformedData);
      setTransformedStudyData(transformedData);
      // You can store or return the processed data here
      return transformedStudyData;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  

  const handleApplyFilters = (appliedFilters, fetchedStudyNames) => {
    setFiltersNew(appliedFilters);
    setStudyNames(fetchedStudyNames);
  };

  useEffect(() => {
    if (filtersNew) {
      fetchData(filtersNew);
    }
  }, [filtersNew]);


  const handleGeneFilterChange = (selectedValue) => {
    setGeneSelection(selectedValue);
  };

  const handleThresholdUpdate = ({
    significanceThreshold,
    foldChangeThreshold,
  }) => {
    setSignificanceThreshold(significanceThreshold);
    setFoldChangeThreshold(foldChangeThreshold);

    // setShouldProcessData(false);
  };

  const handleBaseStudyChange = async (newBaseStudy) => {
    // Reset states more efficiently
    setSelectedBaseStudy(newBaseStudy);
    setFilters({});
    setFilteredData([]);
    setShowPlot(false);
    lastFetchedConfig.current = { baseStudy: "", filters: {} };
  
    try {
      // Optimize studies cache check and fetch
      const transformedStudyData =
        Object.keys(studiesCache).length > 0 ? studiesCache : await fetchData();
      
      console.log("first", transformedStudyData)
  
      // Access the base study data using bracket notation
      const baseStudyData = transformedStudyData[newBaseStudy] ?? [];
      console.log("second", baseStudyData)

      const transformedData = transformData(baseStudyData);
  
      // Memoize calculations to avoid repeated computations
      const calculateMinMaxValues = (data) => {
        // Extract pvalue and log2FoldChange arrays
        const pvalueData = data.pvalue ?? [];
        const log2FoldChangeData = data.log2FoldChange ?? [];
  
        return {
          minPValue:
            pvalueData.length > 0
              ? Math.min(...pvalueData.map((p) => -Math.log10(p)))
              : 0,
          maxPValue:
            pvalueData.length > 0
              ? Math.max(...pvalueData.map((p) => Math.ceil(-Math.log10(p))))
              : 1,
          minLog2FoldChange: 0,
          maxLog2FoldChange:
            log2FoldChangeData.length > 0 ? Math.max(...log2FoldChangeData) : 1,
        };
      };
  
      // Calculate min/max values for sliders
      const { minPValue, maxPValue, minLog2FoldChange, maxLog2FoldChange } =
        calculateMinMaxValues(transformedData);
  
      // Batch state updates to reduce re-renders
      setFilteredData({ data: transformedData });
      setMinMaxValues({
        minPValue,
        maxPValue,
        minLog2FoldChange,
        maxLog2FoldChange,
      });
  
      console.log("State updated with filtered data and min/max values.");
    } catch (error) {
      console.error("Error fetching or processing studies:", error);
    }
  };
  

  const debouncedHandleFilterChange = debounce((study, filter) => {
    setFilters((prevFilters) => {
      if (filter === "") {
        const { [study]: _, ...rest } = prevFilters;
        return rest;
      }
      return { ...prevFilters, [study]: filter };
    });
    console.log(`Filter for ${study} set to ${filter}`);
  }, 300); // 300ms delay

  const handleFilterChange = (study, filter) => {
    debouncedHandleFilterChange(study, filter);
  };

  useEffect(() => {
    // If shouldProcessData is false, skip fetching and processing
    if (!shouldProcessData) {
      return;
    }

    const fetchAndProcessData = async () => {
      console.time("DataFetchingAndProcessingTime");

      // Early return if there are no filters or base study
      if (!selectedBaseStudy) {
        setFilteredData([]);
        return;
      }

      // Check if there's no change in the base study or filters
      const isBaseStudyChanged =
        lastFetchedConfig.current.baseStudy !== selectedBaseStudy;
      const isFiltersChanged =
        JSON.stringify(lastFetchedConfig.current.filters) !==
        JSON.stringify(filters);
      const isThresholdsChanged =
        lastFetchedConfig.current.significanceThreshold !==
          significanceThreshold ||
        lastFetchedConfig.current.foldChangeThreshold !== foldChangeThreshold;
      const isGeneSelectionChanged =
        lastFetchedConfig.current.geneSelection !== geneSelection;

      if (
        !isBaseStudyChanged &&
        !isFiltersChanged &&
        !isThresholdsChanged &&
        !isGeneSelectionChanged
      ) {
        return; // Prevent re-fetching if nothing has changed
      }

      try {
        // Use cached studies or fetch if cache is empty
        const allStudiesData = transformedStudyData

        setAllStudiesDataNew(allStudiesData);

        // Ensure that mustStudyData, notStudyData, and baseStudyData are initialized
        let mustStudyData = [];
        let notStudyData = [];
        let baseStudyData = [];

        Object.keys(filters).forEach((study) => {
          if (allStudiesData[study]) {
            const studyData = allStudiesData[study].map((dataPoint) => ({
              ...dataPoint,
              studyName: study,
            }));

            if (study === selectedBaseStudy) {
              baseStudyData.push(...studyData);
            } else {
              switch (filters[study]) {
                case "Must":
                  mustStudyData.push(...studyData);
                  break;
                case "Not":
                  notStudyData.push(...studyData);
                  break;
              }
            }
          } else {
            console.error(`Study data missing for study: ${study}`);
          }
        });

        setNonBaseStudyData([]);
        let processedBaseStudyData = [];
        let nonBaseStudyData = [];

        const mustGenesSet = new Set(
          mustStudyData.map((mustGene) => mustGene.gene)
        );
        const notGenesSet = new Set(
          notStudyData.map((notGene) => notGene.gene)
        );

        const processGeneOverlaps = (
          foldChangeThreshold,
          significanceThreshold,
          geneSelection
        ) => {
          // First determine if we have any genes in each set
          const hasMustGenes = mustGenesSet.size > 0;
          const hasNotGenes = notGenesSet.size > 0;

          // Determine process type based on gene set contents
          const processType = hasMustGenes && hasNotGenes ? "AND" : "OR";

          processedBaseStudyData = baseStudyData.map((baseGene) => {
            let processedGene = { ...baseGene, type: "base" };

            // Check if the gene exists in mustStudyData and/or notStudyData
            const mustOverlap = mustGenesSet.has(baseGene.gene);
            const notOverlap = notGenesSet.has(baseGene.gene);

            const shouldProcess =
              processType === "AND"
                ? mustOverlap && notOverlap // original AND logic
                : mustOverlap || notOverlap; // new OR logic

            if (shouldProcess) {
              let mustGeneOverlap = false;
              let notGeneOverlap = false;

              // Process Must Study Overlap with significance check
              if (mustOverlap) {
                mustStudyData.forEach((mustGene) => {
                  if (
                    mustGene.gene === baseGene.gene &&
                    Math.abs(mustGene.log2FoldChange) >= foldChangeThreshold &&
                    mustGene.pvalue < significanceThreshold
                  ) {
                    if (geneSelection === "all") {
                      mustGeneOverlap =
                        (baseGene.log2FoldChange > foldChangeThreshold &&
                          mustGene.log2FoldChange > foldChangeThreshold) ||
                        (baseGene.log2FoldChange < -foldChangeThreshold &&
                          mustGene.log2FoldChange < -foldChangeThreshold);
                    } else if (geneSelection === "upregulated") {
                      mustGeneOverlap =
                        baseGene.log2FoldChange > foldChangeThreshold &&
                        mustGene.log2FoldChange > foldChangeThreshold;
                    } else if (geneSelection === "downregulated") {
                      mustGeneOverlap =
                        baseGene.log2FoldChange < -foldChangeThreshold &&
                        mustGene.log2FoldChange < -foldChangeThreshold;
                    }
                  }
                });
              }

              // Process Not Study Overlap with significance check
              if (notOverlap) {
                notStudyData.forEach((notGene) => {
                  if (
                    notGene.gene === baseGene.gene &&
                    Math.abs(notGene.log2FoldChange) >= foldChangeThreshold &&
                    notGene.pvalue < significanceThreshold
                  ) {
                    if (geneSelection === "all") {
                      notGeneOverlap =
                        (baseGene.log2FoldChange > foldChangeThreshold &&
                          notGene.log2FoldChange < -foldChangeThreshold) ||
                        (baseGene.log2FoldChange < -foldChangeThreshold &&
                          notGene.log2FoldChange > foldChangeThreshold);
                    } else if (geneSelection === "upregulated") {
                      notGeneOverlap =
                        baseGene.log2FoldChange > foldChangeThreshold &&
                        notGene.log2FoldChange < -foldChangeThreshold;
                    } else if (geneSelection === "downregulated") {
                      notGeneOverlap =
                        baseGene.log2FoldChange < -foldChangeThreshold &&
                        notGene.log2FoldChange > foldChangeThreshold;
                    }
                  }
                });
              }

              // Assign overlap type
              if (mustGeneOverlap && notGeneOverlap) {
                processedGene.type = "overlap-both";
                processedGene.overlapSource = "both";
              } else if (mustGeneOverlap) {
                processedGene.type = "overlap-must";
                processedGene.overlapSource = "must";
              } else if (notGeneOverlap) {
                processedGene.type = "overlap-not";
                processedGene.overlapSource = "not";
              }

              // Add to nonBaseStudyData if the type is not "base"
              if (processedGene.type !== "base") {
                setNonBaseStudyData((prevData) => [...prevData, processedGene]);
              }
            }

            return processedGene;
          });
        };

        // Process overlaps only if we have necessary conditions
        if (
          baseStudyData.length > 0 &&
          significanceThreshold &&
          foldChangeThreshold
        ) {
          processGeneOverlaps(
            foldChangeThreshold,
            significanceThreshold,
            geneSelection
          );
        }

        lastFetchedConfig.current = { baseStudy: selectedBaseStudy, filters };

        // Now that we have processed the data, transform it
        const transformedData = transformData(processedBaseStudyData);

        setProcessedData(processedBaseStudyData);
        setFilteredData({ data: transformedData });
        setShowPlot(true);
      } catch (error) {
        console.error("Error fetching study data:", error);
      } finally {
        // End timing and log the duration
        console.timeEnd("DataFetchingAndProcessingTime");

        setShouldProcessData(false);
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, [
    loading,
    shouldProcessData,
    selectedBaseStudy,
    filters,
    significanceThreshold,
    foldChangeThreshold,
    geneSelection,
  ]);
// table 


useEffect(() => {
  
  if (
    !selectedBaseStudy ||
    !allStudiesDataNew ||
    Object.keys(allStudiesDataNew).length === 0
  ) {
    console.log("No base study selected or no data available.");
    setUpregulatedData([]);
    setDownregulatedData([]);
    return;
  }

  // Compute base study genes
  const baseStudyGenes =
    allStudiesDataNew[selectedBaseStudy]?.filter(
      (gene) =>
        Math.abs(gene.log2FoldChange) >= foldChangeThreshold &&
        gene.pvalue < significanceThreshold
    ) || [];


  // Create a map for base study genes
  const baseStudyGeneMap = new Map(
    baseStudyGenes.map((gene) => [gene.gene, gene])
  );

  // Create maps for all studies
  const studyGeneMaps = Object.entries(allStudiesDataNew).reduce(
    (maps, [study, studyGenes]) => {
      console.log(`Study: ${study}, Total Genes: ${studyGenes.length}`);
      maps[study] = new Map(studyGenes.map((gene) => [gene.gene, gene]));
      return maps;
    },
    {}
  );

  const transformData = (genes) => {
    console.log("Transforming Data for Genes:", genes.length);
    return genes.map((gene) => {
      const formattedRow = { gene: gene.gene };
      Object.keys(allStudiesDataNew).forEach((study) => {
        const studyGene = studyGeneMaps[study].get(gene.gene);
        formattedRow[`${study}_log2FoldChange`] = studyGene ? studyGene.log2FoldChange : null;
        formattedRow[`${study}_pvalue`] = studyGene ? studyGene.pvalue : null;
      });
      return formattedRow;
    });
  };

  // Separate logic for base and non-base studies
  const prepareData = () => {
    console.log("Preparing data for base study...");
    const upregulatedGenes = [];
    const downregulatedGenes = [];

    baseStudyGenes.forEach((gene) => {
      if (
        gene.log2FoldChange >= foldChangeThreshold &&
        gene.negativeLog10PValue >= significanceThreshold
      ) {
        upregulatedGenes.push(gene);
      } else if (
        gene.log2FoldChange <= -foldChangeThreshold &&
        gene.negativeLog10PValue >= significanceThreshold
      ) {
        downregulatedGenes.push(gene);
      }
    });

    console.log("Upregulated Genes Count:", upregulatedGenes.length);
    console.log("Downregulated Genes Count:", downregulatedGenes.length);

    setUpregulatedData(transformData(upregulatedGenes));
    setDownregulatedData(transformData(downregulatedGenes));

    setUpregulatedCount(upregulatedGenes.length);
    setDownregulatedCount(downregulatedGenes.length);
  };

  const prepareOverlapData = () => {
    console.log("Preparing overlap data...");
    if (!nonBaseStudyData.length) {
      console.log("No non-base study data found. Preparing base data only.");
      prepareData();
      return;
    }

    console.log("Non-Base Study Data Count:", nonBaseStudyData.length);

    const nonBaseStudyGenes = nonBaseStudyData.filter(
      (gene) =>
        Math.abs(gene.log2FoldChange) >= foldChangeThreshold &&
        gene.pvalue < significanceThreshold
    );

    console.log("Filtered Non-Base Study Genes Count:", nonBaseStudyGenes.length);

    const overlapGenes = nonBaseStudyGenes.filter((gene) =>
      baseStudyGeneMap.has(gene.gene)
    );

    console.log("Overlap Genes Count:", overlapGenes.length);

    const upregulatedGenes = [];
    const downregulatedGenes = [];

    overlapGenes.forEach((gene) => {
      if (
        gene.log2FoldChange >= foldChangeThreshold &&
        gene.negativeLog10PValue >= significanceThreshold
      ) {
        upregulatedGenes.push(gene);
      } else if (
        gene.log2FoldChange <= -foldChangeThreshold &&
        gene.negativeLog10PValue >= significanceThreshold
      ) {
        downregulatedGenes.push(gene);
      }
    });

    console.log("Overlap - Upregulated Genes Count:", upregulatedGenes.length);
    console.log("Overlap - Downregulated Genes Count:", downregulatedGenes.length);

    setUpregulatedData(transformData(upregulatedGenes));
    setDownregulatedData(transformData(downregulatedGenes));

    setUpregulatedCount(upregulatedGenes.length);
    setDownregulatedCount(downregulatedGenes.length);
  };

  prepareOverlapData();
}, [
  selectedBaseStudy,
  allStudiesDataNew,
  foldChangeThreshold,
  significanceThreshold,
  nonBaseStudyData,
]);


  const transformData = (combinedData) => {
    if (!Array.isArray(combinedData) || combinedData.length === 0) {
      console.warn("No data to transform");
      return {
        gene: [],
        baseMean: [],
        log2FoldChange: [],
        pvalue: [],
        padj: [],
        negativeLog10PValue: [],
        type: [],
        studyName: [],
      };
    }

    // Initialize the transformed object with empty arrays
    const transformed = {
      gene: [],
      baseMean: [],
      log2FoldChange: [],
      pvalue: [],
      padj: [],
      negativeLog10PValue: [],
      type: [],
      studyName: [],
    };

    // Populate the arrays from the combined data
    combinedData.forEach((item) => {
      transformed.gene.push(item.gene);
      transformed.baseMean.push(item.baseMean);
      transformed.log2FoldChange.push(item.log2FoldChange);
      transformed.pvalue.push(item.pvalue);
      transformed.padj.push(item.padj || 0); // You can replace null with 0.5 if needed
      transformed.negativeLog10PValue.push(item.negativeLog10PValue);
      transformed.type.push(item.type || "base");
      transformed.studyName.push(item.studyName);
    });

    return transformed;
  };

  // Memoize the final render data
  const renderData = useMemo(
    () => ({
      showContent:
        showPlot && filteredData && Object.keys(filteredData).length > 0,
      data: filteredData.data,
      minPValue: filteredData.minPValue,
      maxPValue: filteredData.maxPValue,
      minLog2FoldChange: filteredData.minLog2FoldChange,
      maxLog2FoldChange: filteredData.maxLog2FoldChange,
    }),
    [showPlot, filteredData]
  );

  return (
    <Flex h="100vh" flex="1">
      {/* Sidebar (DGEAnalysisFilter) */}
      <Box
        height="100vh" // Full screen height
        w="20%" // 20% width for the filter
        minW="200px"
        maxW="250px"
        display="flex"
        flexDirection="column"
        overflowY="auto"
        top="0" // Stick to the top of the page
        left="0" // Align to the left
        bg="white"
        boxShadow="sm"
        borderRight="1px solid #ddd"
      >
        <DGEAnalysisFilter onApplyFilters={handleApplyFilters} />
      </Box>

      {/* Main Content Area */}
      <Box
        flex="1" // Take remaining space
        display="flex"
        flexDirection="column" // Stack the content vertically
        alignItems="center"
      >
        {/* FilterComponent Section */}
        <Box
          borderRadius="8px"
          width="100%"
          mb="20px" // Margin below the filter component to separate it from the content
        >
          <FilterComponent
            studyNames={studyNames}
            // studies={studyFiles.map(formatStudyName)}
            selectedBaseStudy={selectedBaseStudy}
            setSelectedBaseStudy={handleBaseStudyChange}
            onFilterChange={handleFilterChange}
            // onShowPlot={handleShowVolcanoPlot}
            minPValue={minMaxValues.minPValue}
            maxPValue={minMaxValues.maxPValue}
            minLog2FoldChange={minMaxValues.minLog2FoldChange}
            maxLog2FoldChange={minMaxValues.maxLog2FoldChange}
            sendThresholdsToAnalysis={handleThresholdUpdate}
            onGeneFilterChange={handleGeneFilterChange}
            setShouldProcessData={setShouldProcessData}
          />
        </Box>

        {loading ? (
          <Loader />
        ) : (
          <Box>
            {renderData.showContent && (
              <Flex
                borderRadius="8px"
                width="100%"
                justifyContent="center"
                alignItems="center"
                flexDirection="column"
              >
                <DgeAnalysisMain
                  alldata={allStudiesDataNew}
                  data={renderData.data}
                  minPValue={renderData.minPValue}
                  maxPValue={renderData.maxPValue}
                  minLog2FoldChange={renderData.minLog2FoldChange}
                  maxLog2FoldChange={renderData.maxLog2FoldChange}
                  significanceThreshold={significanceThreshold}
                  foldChangeThreshold={foldChangeThreshold}
                  geneSelection={geneSelection}
                  upregulatedData={upregulatedData}
                  downregulatedData={downregulatedData}
                  upregulatedCount={upregulatedCount}
                  downregulatedCount={downregulatedCount}
                />
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
};

export default DgeAnalysisNew;
