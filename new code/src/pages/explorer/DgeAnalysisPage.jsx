import React, { useEffect, useState } from "react";
import { Box, Text, Alert, AlertIcon } from "@chakra-ui/react";
import DgeFilter from "../../components/explorer/dge-analysis/DgeFilter";
import DgeAnalysisMain from "../../components/explorer/dge-analysis/DgeAnalysisMain";
import Loader from "../../components/Loader";
import { useStudyNode } from "./StudyNodeContext";

const DgeAnalysisPage = ({ setActiveComponent }) => {
  const { nodeId, breadcrumbElement } = useStudyNode();

  const [allFiltersData, setAllFiltersData] = useState([]);
  const [splitByKeyOptions, setSplitByKeyOptions] = useState([]);
  const [comparisonOptions, setComparisonOptions] = useState([]);
  const [cellTypeLevelOptions, setCellTypeLevelOptions] = useState([]);
  const [cellTypeOptions, setCellTypeOptions] = useState([]);
  const [shrinkageOptions, setShrinkageOptions] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [usedFilters, setUsedFilters] = useState(selectedFilters); // Filters used by the user to get a data. This will be passed to the push to enrichment section

  const [dgeData, setDgeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // State for error messages

  // Fetch filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setError(null); // Reset error before fetch
        const response = await fetch(`/api/${nodeId}/dge/filters`);
        if (!response.ok) {
          throw new Error("Failed to fetch filters. Please try again later.");
        }

        const data = await response.json();

        setAllFiltersData(data);

        // Set the options
        const splitByKeySet = new Set(data.map((item) => item.split_by_key));
        setSplitByKeyOptions([...splitByKeySet]);

        const comparisonSet = new Set(data.map((item) => item.comparison));
        setComparisonOptions([...comparisonSet]);

        const cellTypeLevelSet = new Set(
          data.map((item) => item.cell_type_level)
        );
        setCellTypeLevelOptions([...cellTypeLevelSet]);

        const cellTypeSet = new Set(data.map((item) => item.cell_type));
        setCellTypeOptions([...cellTypeSet]);

        const shrinkageSet = new Set(data.map((item) => item.shrinkage));
        setShrinkageOptions([...shrinkageSet]);

        // Set selectedFilters with the first value of each option
        const defaultFilters = {
          splitByKey: [...splitByKeySet][0] || "",
          comparison: [...comparisonSet][0] || "",
          cellTypeLevel: [...cellTypeLevelSet][0] || "",
          cellType: [...cellTypeSet][0] || "",
          shrinkage: [...shrinkageSet][0],
        };

        setSelectedFilters(defaultFilters);

        // Call fetchDgeData after setting default filters
        fetchDgeData(defaultFilters);
      } catch (err) {
        setError(
          err.message || "An unexpected error occurred while fetching filters."
        );
        setLoading(false);
      }
    };

    fetchFilters();
  }, [nodeId]);

  // Fetch DGE data
  const fetchDgeData = async (filters = selectedFilters) => {
    try {
      setError(null); // Reset error before fetch
      setLoading(true);
      setUsedFilters(filters); // update the used filters if new data is fetched

      const { splitByKey, comparison, cellTypeLevel, cellType, shrinkage } =
        filters;
      const response = await fetch(
        `/api/${nodeId}/dge/result?split_by_key=${splitByKey}&comparison=${comparison}&cell_type_level=${cellTypeLevel}&cell_type=${cellType}&shrinkage=${shrinkage}`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch DGE data. Please check your filters or try again later."
        );
      }

      const data = await response.json();
      setDgeData(data);
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred while fetching DGE data."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update options when filters change
  useEffect(() => {
    try {
      let filteredData = allFiltersData;

      if (selectedFilters.splitByKey) {
        filteredData = filteredData.filter(
          (item) => item.split_by_key === selectedFilters.splitByKey
        );

        const comparisonSet = new Set(
          filteredData.map((item) => item.comparison)
        );
        setComparisonOptions([...comparisonSet]);

        if (selectedFilters.comparison) {
          filteredData = filteredData.filter(
            (item) => item.comparison === selectedFilters.comparison
          );

          const cellTypeLevelSet = new Set(
            filteredData.map((item) => item.cell_type_level)
          );
          setCellTypeLevelOptions([...cellTypeLevelSet]);

          if (selectedFilters.cellTypeLevel) {
            filteredData = filteredData.filter(
              (item) => item.cell_type_level === selectedFilters.cellTypeLevel
            );

            const cellTypeSet = new Set(
              filteredData.map((item) => item.cell_type)
            );
            setCellTypeOptions([...cellTypeSet]);

            if (selectedFilters.cellType) {
              filteredData = filteredData.filter(
                (item) => item.cell_type === selectedFilters.cellType
              );

              const shrinkageSet = new Set(
                filteredData.map((item) => item.shrinkage)
              );
              setShrinkageOptions([...shrinkageSet]);
            }
          }
        }
      }
    } catch (err) {
      setError("An unexpected error occurred while processing filters.");
    }
  }, [selectedFilters, allFiltersData]);

  const handleApplyFilters = () => {
    fetchDgeData();
  };

  return (
    <>
      <Box display="flex" p={0} px={0} className="h-screen">
        <DgeFilter
          splitByKeyOptions={splitByKeyOptions}
          comparisonOptions={comparisonOptions}
          cellTypeLevelOptions={cellTypeLevelOptions}
          cellTypeOptions={cellTypeOptions}
          shrinkageOptions={shrinkageOptions}
          selectedFilters={selectedFilters}
          setSelectedFilters={setSelectedFilters}
          onApplyFilters={handleApplyFilters}
        />
        <Box width="85%" height="max-content">
          {breadcrumbElement}
          {error && (
            <Alert status="error" mb={4}>
              <AlertIcon />
              {error}
            </Alert>
          )}
          {loading ? (
            <Loader />
          ) : dgeData ? (
            <Box>
              <DgeAnalysisMain
                data={dgeData}
                usedFilters={usedFilters}
                setActiveComponent={setActiveComponent}
              />
            </Box>
          ) : (
            <Text textAlign="center" mt={4}>
              No Data to show. Apply filter to get started.
            </Text>
          )}
        </Box>
      </Box>
    </>
  );
};

export default DgeAnalysisPage;
