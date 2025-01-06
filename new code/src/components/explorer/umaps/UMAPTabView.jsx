import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Select,
  Text,
  Button,
  IconButton,
} from "@chakra-ui/react";
import AsyncSelect from "react-select/async"; // Import React Select's Async component
import CellUmap from "./CellUmap";
import GeneUMAP from "./GeneUmap"; // Corrected relative import
import { FaDna, FaDisease } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import html2canvas from "html2canvas-pro";

const UMAPTabView = ({
  plotData,
  colorOptions = [],
  geneOptions = [], // Gene options to populate in the AsyncSelect
  selectedColor,
  selectedGene,
  applyFilters,
  plotLabel,
  setActiveComponent,
}) => {
  const [localColor, setLocalColor] = useState(selectedColor || "");
  const [localGene, setLocalGene] = useState(selectedGene || "");
  const cellUmapRef = useRef(); // Reference for capturing the UMAP component
  const geneUmapRef = useRef(); // Reference for capturing the UMAP component

  // Automatically update local state when props change (e.g., selectedColor or selectedGene)
  useEffect(() => {
    if (selectedColor) setLocalColor(selectedColor);
    if (selectedGene) setLocalGene(selectedGene);
  }, [selectedColor, selectedGene]);

  // Handle color change (for Cell UMAP)
  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setLocalColor(newColor);
    applyFilters({ color: newColor });
  };

  // Handle gene change (for Gene UMAP)
  const handleGeneChange = (selectedOption) => {
    if (!selectedOption) {
      // Clear selection if the user clears the value
      setLocalGene("");
      applyFilters({ gene: "" });
    } else {
      const newGene = selectedOption.value;
      setLocalGene(newGene);
      applyFilters({ gene: newGene });
    }
  };

  // Async search for gene options (client-side search)
  const loadGeneOptions = (inputValue, callback) => {
    if (inputValue.length > 0) {
      const filteredGenes = geneOptions.filter((gene) =>
        gene.toLowerCase().startsWith(inputValue.toLowerCase())
      );

      const options = filteredGenes.map((gene) => ({
        value: gene,
        label: gene,
      }));

      callback(options);
    } else {
      callback([]);
    }
  };

  // Handle the download as image functionality
  const handleDownload = (ref) => {
    // Capture the element with html2canvas
    html2canvas(ref.current).then((canvas) => {
      // Create an anchor element for download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "umap_plot.png";
      link.click();
    });
  };

  return (
    <Box mt={4}>
      {/* Chakra UI Tabs */}
      <Tabs isFitted variant="unstyled">
        {/* TabList contains Cell and Gene tabs */}
        <TabList
          margin="30px 16px"
          marginBottom="10px"
          width="30%"
          bg="#ffffff"
          padding="10px"
          borderRadius="16px"
          shadow="md"
        >
          <Tab
            position="relative"
            backgroundColor="#f5f7fa"
            _selected={{
              color: "black",
              backgroundColor: "#e0eafc",
            }}
            _notLast={{
              mr: "2",
            }}
            _hover={{ bg: "#d0ddef" }}
            _active={{ bg: "#c0cde0" }}
            _focus={{ outline: "none" }}
            mx="10px"
            borderRadius="md"
            fontSize="15px"
            fontWeight="light"
            transition="background-color 0.2s"
            color="black" // Use black for all text
          >
            <FaDisease style={{ marginRight: "10px", color: "#4F4F4F" }} />
            Cell
          </Tab>
          <Tab
            position="relative"
            backgroundColor="#f5f7fa"
            _selected={{
              color: "black",
              backgroundColor: "#e0eafc",
            }}
            _notLast={{
              mr: "2",
            }}
            _hover={{ bg: "#d0ddef" }}
            _active={{ bg: "#c0cde0" }}
            _focus={{ outline: "none" }}
            mx="10px"
            borderRadius="md"
            fontSize="15px"
            fontWeight="light"
            transition="background-color 0.2s"
            color="black"
          >
            <FaDna style={{ marginRight: "10px", color: "#4F4F4F" }} />
            Gene
          </Tab>
        </TabList>

        {/* TabPanels to contain the content for Cell and Gene */}
        <TabPanels margin="10px 0">
          {/* Cell Tab Content */}
          <TabPanel>
            {/* Color dropdown for "Cell" tab */}
            {colorOptions.length > 0 && (
              <div className="flex justify-between items-center border rounded-md p-4 pb-8 border-b-0 rounded-bl-none rounded-br-none">
                <Select
                  value={localColor}
                  onChange={handleColorChange}
                  width="300px" // Fixed width for visual consistency
                  borderRadius="18px" // Add a border radius of 18px
                >
                  {colorOptions.map((color, idx) => (
                    <option key={idx} value={color}>
                      {color}
                    </option>
                  ))}
                </Select>

                <IconButton
                  icon={<FaDownload />}
                  aria-label="Download data as CSV"
                  colorScheme="blue"
                  onClick={() => {
                    handleDownload(cellUmapRef);
                  }}
                />
              </div>
            )}

            {/* Render ScatterPlotCanvas for Cell */}
            <Box flex="1" p={0} textAlign="left">
              <CellUmap
                plotData={plotData}
                color={localColor}
                plotLabel={plotLabel}
                setActiveComponent={setActiveComponent}
                cellUmapRef={cellUmapRef}
              />
            </Box>
          </TabPanel>

          {/* Gene Tab Content */}
          <TabPanel>
            {/* Gene dropdown */}

            <Box className="flex justify-between items-center border rounded-md p-4 pb-8 border-b-0 rounded-bl-none rounded-br-none">
              <AsyncSelect
                cacheOptions
                loadOptions={loadGeneOptions}
                defaultOptions={[]}
                onChange={handleGeneChange}
                // Dynamically update the placeholder based on localGene value
                placeholder={
                  localGene ? `Selected gene: ${localGene}` : "FCGR3A"
                }
                value={
                  localGene ? { label: localGene, value: localGene } : null
                }
                isClearable
                noOptionsMessage={() => "Start typing..."}
                styles={{
                  control: (provided) => ({
                    ...provided,
                    width: "300px",
                    minWidth: "300px",
                    borderRadius: "18px", // Add border-radius for rounded corners
                  }),
                  menu: (provided) => ({
                    ...provided,
                    width: "300px",
                    minWidth: "300px",
                    zIndex: 9999,
                    marginTop: "2px",
                  }),
                }}
              />

              <IconButton
                icon={<FaDownload />}
                aria-label="Download data as CSV"
                colorScheme="blue"
                onClick={() => {
                  handleDownload(geneUmapRef);
                }}
              />
            </Box>

            {/* Render GeneUMAP for Gene */}
            <Box flex="1" p={0} textAlign="left">
              {plotData && plotData.length > 0 ? (
                <GeneUMAP
                  plotData={plotData}
                  gene={localGene}
                  geneUmapRef={geneUmapRef}
                />
              ) : (
                <Text>
                  No data available. Apply filters to display the plot.
                </Text>
              )}
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default UMAPTabView;
