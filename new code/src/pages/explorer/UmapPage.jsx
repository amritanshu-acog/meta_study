import React, { useState, useEffect } from "react";
import { Box, Text } from "@chakra-ui/react";
import UmapFilter from "../../components/explorer/umaps/UmapFilter";
import axios from "axios";
import UMAPTabView from "../../components/explorer/umaps/UMAPTabView";
import Loader from "../../components/Loader";
import { useStudyNode } from "./StudyNodeContext";

const UmapPage = ({ setActiveComponent }) => {
  const { nodeId, breadcrumbElement } = useStudyNode();
  const [filters, setFilters] = useState([]);
  const [selectedSplitBy, setSelectedSplitBy] = useState("");
  const [samples, setSamples] = useState([]);
  const [numberOfUMAPs, setNumberOfUMAPs] = useState(1);
  const [umapSplits, setUmapSplits] = useState({});
  const [plotData, setPlotData] = useState([]);
  const [colorOptions, setColorOptions] = useState([]);
  const [geneOptions, setGeneOptions] = useState([]);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedGene, setSelectedGene] = useState("FCGR3A");
  const [plotLabel, setPlotLabel] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only execute if samples are available
    if (samples.length > 0) {
      samples.forEach((sample, index) => {
        const samplesForValue = sample.samples;

        setUmapSplits((prevSplits) => ({
          ...prevSplits,
          [`split_${index + 1}`]: {
            splitByValue: sample.split_by_val,
            sample: samplesForValue,
          },
        }));
      });
    }
  }, [samples]);

  useEffect(() => {
    const setDefaultFilters = (data) => {
      const splitByDefaultIndex = data.split_by_default_idx;
      const colorByKeyDefaultIndex = data.color_by_key_default_idx;
      const defaultSplitByMenu = data.split_by_menu[splitByDefaultIndex];

      setSelectedSplitBy(defaultSplitByMenu.split_by_key);
      setNumberOfUMAPs(defaultSplitByMenu.split_by_vals_vs_samples.length);
      setSamples(defaultSplitByMenu.split_by_vals_vs_samples);

      const defaultSelectedColor = data.color_by_keys[colorByKeyDefaultIndex];
      setSelectedColor(defaultSelectedColor);
    };

    const fetchFilters = async () => {
      const apiUrl = `/api/${nodeId}/umaps/filters`;
      try {
        const response = await axios.get(apiUrl);

        setFilters(response.data.split_by_menu);
        setColorOptions(response.data.color_by_keys);
        setGeneOptions(response.data.genes);
        setDefaultFilters(response.data);
      } catch (error) {
        console.error("Error fetching the filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // Apply filters on first load with default settings
  useEffect(() => {
    if (samples.length > 0) {
      applyFilters();
    }
  }, [samples]);

  const applyFilters = async (overrideParams = {}) => {
    const selectedPlotLabels = [];

    const splitByValsVsSamples = Array.from(
      { length: numberOfUMAPs },
      (_, index) => {
        const split = umapSplits[`split_${index + 1}`];
        const splitByVal = split?.splitByValue || "";

        if (splitByVal) {
          selectedPlotLabels.push(splitByVal);
        }

        return {
          split_by_val: splitByVal,
          samples: split?.sample || [],
        };
      }
    );

    setPlotLabel(selectedPlotLabels);

    const category_key_to_apply = overrideParams.color
      ? overrideParams.color
      : selectedColor;

    const params = {
      anndata_filename: "kawasaki",
      split_by_key: selectedSplitBy,
      category_key: category_key_to_apply,
      split_by_vals_vs_samples: JSON.stringify(splitByValsVsSamples),
      gene_key: overrideParams.gene || selectedGene,
    };

    const apiUrl = `/api/${nodeId}/umaps/data`;
    try {
      const response = await axios.get(apiUrl, { params });
      setPlotData(response.data);
    } catch (error) {
      console.error("Error applying filters:", error);
    }

    setLoading(false);
  };

  return (
    <>
      <Box display="flex" p={0} px={0} className="h-screen">
        <UmapFilter
          filters={filters}
          samples={samples}
          setSamples={setSamples}
          selectedSplitBy={selectedSplitBy}
          setSelectedSplitBy={setSelectedSplitBy}
          numberOfUMAPs={numberOfUMAPs}
          setNumberOfUMAPs={setNumberOfUMAPs}
          umapSplits={umapSplits}
          setUmapSplits={setUmapSplits}
          applyFilters={applyFilters}
        />
        <Box width="85%" height="max-content">
          {loading ? (
            <Loader />
          ) : (
            <Box>
              {breadcrumbElement}
              <UMAPTabView
                plotData={plotData}
                colorOptions={colorOptions}
                geneOptions={geneOptions}
                selectedColor={selectedColor}
                selectedGene={selectedGene}
                applyFilters={applyFilters}
                plotLabel={plotLabel}
                setActiveComponent={setActiveComponent}
              />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default UmapPage;
