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

  const studyFiles = [
    "JD-32-178.json",
    "KD-32-165.json",
    "MP-39-115.json",
    "SLE-32-234.json",
  ];
  const fetchCounts = useRef({});
  const formatStudyName = (studyFilename) => studyFilename.replace(".json", "");

  const fetchAllStudies = async () => {
    if (Object.keys(studiesCache).length > 0) {
      return studiesCache;
    }
    const allStudiesData = {};

    for (const filename of studyFiles) {
      const study = formatStudyName(filename);

      if (!fetchCounts.current[study]) {
        fetchCounts.current[study] = 0;
      }
      fetchCounts.current[study] += 1;

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

          allStudiesData[study] = studyData;
        } else {
          console.error(`Data arrays have unequal lengths for study: ${study}`);
        }
      } catch (error) {
        console.error(`Error fetching study ${study}:`, error);
      }
    }
    setStudiesCache(allStudiesData);
    console.log("all fetched data", allStudiesData)

    console.log("Fetch counts:", fetchCounts.current);
    return allStudiesData;
  };

  const handleShowVolcanoPlot = () => {
    if (!selectedBaseStudy) {
      console.error("Please select a base study first.");
      return;
    }

    // Validate if filters or base study data is ready
    if (filteredData && filteredData.data) {
      setShowPlot(true); // Only display the plot here
    } else {
      console.error("Filtered data is not ready.");
    }
  };

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
    console.log("Starting handleBaseStudyChange...");
    console.log("Selected new base study:", newBaseStudy);

    // Reset states more efficiently
    setSelectedBaseStudy(newBaseStudy);
    setFilters({});
    setFilteredData([]);
    setShowPlot(false);
    lastFetchedConfig.current = { baseStudy: "", filters: {} };
    console.log("States reset. Filters and plot hidden.");

    try {
      // Optimize studies cache check and fetch
      const allStudiesData =
        Object.keys(studiesCache).length > 0
          ? studiesCache
          : await fetchAllStudies();
      console.log("Fetched or used cached studies data.");

      // Use optional chaining and nullish coalescing for safer data access
      const baseStudyData = allStudiesData[formatStudyName(newBaseStudy)] ?? [];
      console.log("Base study data fetched:", baseStudyData);

      const transformedData = transformData(baseStudyData);
      console.log("Transformed base study data:", transformedData);

      // Memoize calculations to avoid repeated computations
      const calculateMinMaxValues = (data) => {
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

      const { minPValue, maxPValue, minLog2FoldChange, maxLog2FoldChange } =
        calculateMinMaxValues(transformedData);

      console.log("Calculated min/max values:");
      console.log("Min P-Value:", minPValue, "Max P-Value:", maxPValue);
      console.log(
        "Min Log2 Fold Change:",
        minLog2FoldChange,
        "Max Log2 Fold Change:",
        maxLog2FoldChange
      );

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
      console.log("Fetching and processing data...");

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
        const allStudiesData =
          Object.keys(studiesCache).length > 0
            ? studiesCache
            : await fetchAllStudies();

        setAllStudiesDataNew(allStudiesData);
        console.log("ALL data", allStudiesDataNew);

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

  useEffect(() => {
    if (
      !selectedBaseStudy ||
      !allStudiesDataNew ||
      Object.keys(allStudiesDataNew).length === 0
    ) {
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
        maps[study] = new Map(studyGenes.map((gene) => [gene.gene, gene]));
        return maps;
      },
      {}
    );

    const transformData = (genes) => {
      return genes.map((gene) => {
        const formattedRow = { gene: gene.gene };
        Object.entries(studyGeneMaps).forEach(([study, studyGeneMap]) => {
          const studyGene = studyGeneMap.get(gene.gene);
          if (studyGene) {
            formattedRow[`${study}_log2FoldChange`] =
              studyGene.log2FoldChange || null;
            formattedRow[`${study}_pvalue`] = studyGene.pvalue || null;
          }
        });
        return formattedRow;
      });
    };

    // Separate logic for base and non-base studies
    const prepareData = () => {
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

      setUpregulatedData(transformData(upregulatedGenes));
      setDownregulatedData(transformData(downregulatedGenes));

      setUpregulatedCount(upregulatedGenes.length);
      setDownregulatedCount(downregulatedGenes.length);

      console.log(`Upregulated genes: ${upregulatedGenes.length}`);
    console.log(`Downregulated genes: ${downregulatedGenes.length}`);
    };

    const prepareOverlapData = () => {
      if (!nonBaseStudyData.length) {
        prepareData();
        return;
      }

      const nonBaseStudyGenes = nonBaseStudyData.filter(
        (gene) =>
          Math.abs(gene.log2FoldChange) >= foldChangeThreshold &&
          gene.pvalue < significanceThreshold
      );

      const overlapGenes = nonBaseStudyGenes.filter((gene) =>
        baseStudyGeneMap.has(gene.gene)
      );

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

      setUpregulatedData(transformData(upregulatedGenes));
      setDownregulatedData(transformData(downregulatedGenes));

      setUpregulatedCount(upregulatedGenes.length);
      setDownregulatedCount(downregulatedGenes.length);

      

    console.log(`Overlap - Upregulated genes: ${upregulatedGenes.length}`);
    console.log(`Overlap - Downregulated genes: ${downregulatedGenes.length}`);
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
    <Flex h="90vh" flex="1" borderLeft="1px solid #ddd">
      {/* Sidebar (DGEAnalysisFilter) */}
      <Box
        height="100%" // Full screen height
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
      >
        <DGEAnalysisFilter />
      </Box>

      {/* Main Content Area */}
      <Box
        flex="1" // Take remaining space
        borderLeft="1px solid #ddd"
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
            studies={studyFiles.map(formatStudyName)}
            selectedBaseStudy={selectedBaseStudy}
            setSelectedBaseStudy={handleBaseStudyChange}
            onFilterChange={handleFilterChange}
            onShowPlot={handleShowVolcanoPlot}
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
                borderLeft="1px solid #ddd"
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
