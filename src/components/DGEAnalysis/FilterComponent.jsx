import React, { useState, useRef } from "react";
import {
  Box,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Button,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  Text,
  FormControl,
  FormLabel,
  Grid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import FAQModal from "./FAQModal";

const FilterComponent = ({
  studies,
  selectedBaseStudy,
  setSelectedBaseStudy,
  onFilterChange,
  onGeneFilterChange,
  // onShowPlot,
  minPValue,
  maxPValue,
  minLog2FoldChange,
  maxLog2FoldChange,
  sendThresholdsToAnalysis,
  setShouldProcessData,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedFilters, setSelectedFilters] = useState(
    studies.reduce((acc, study) => ({ ...acc, [study]: "" }), {})
  );
  const prevSelectedBaseStudy = useRef(selectedBaseStudy);
  const prevSelectedFilters = useRef(selectedFilters);

  const [significanceThreshold, setSignificanceThreshold] = useState(1);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(1);
  const [geneSelection, setGeneSelection] = useState("all"); // options: 'all', 'upregulated', 'downregulated'
  const [tempSignificanceThreshold, setTempSignificanceThreshold] = useState(
    significanceThreshold
  );
  const [tempFoldChangeThreshold, setTempFoldChangeThreshold] =
    useState(foldChangeThreshold);
  const prevSignificanceThreshold = useRef(tempSignificanceThreshold);
  const prevFoldChangeThreshold = useRef(tempFoldChangeThreshold);
  const prevGeneSelection = useRef(geneSelection);

  const handleShowVolcanoPlot = () => {
    if (!selectedBaseStudy) {
      return;
    }

    // Compare the current base study and filters with the previous ones
    const hasBaseStudyChanged =
      prevSelectedBaseStudy.current !== selectedBaseStudy;
    const hasFiltersChanged =
      JSON.stringify(prevSelectedFilters.current) !==
      JSON.stringify(selectedFilters);

    // Compare the sliders and gene selection
    const hasSlidersChanged =
      prevSignificanceThreshold.current !== tempSignificanceThreshold ||
      prevFoldChangeThreshold.current !== tempFoldChangeThreshold;
    const hasGeneSelectionChanged = prevGeneSelection.current !== geneSelection;

    if (
      hasBaseStudyChanged ||
      hasFiltersChanged ||
      hasSlidersChanged ||
      hasGeneSelectionChanged
    ) {
      // Update the main thresholds only when the button is clicked
      setSignificanceThreshold(tempSignificanceThreshold);
      setFoldChangeThreshold(tempFoldChangeThreshold);

      // Trigger data processing with the updated thresholds
      sendThresholdsToAnalysis({
        significanceThreshold: tempSignificanceThreshold,
        foldChangeThreshold: tempFoldChangeThreshold,
      });

      setShouldProcessData(true); // Notify parent to process data

      // Update the previous states
      prevSelectedBaseStudy.current = selectedBaseStudy; // Update the previous base study
      prevSelectedFilters.current = selectedFilters; // Update the previous filters
      prevSignificanceThreshold.current = tempSignificanceThreshold; // Update significance threshold
      prevFoldChangeThreshold.current = tempFoldChangeThreshold; // Update fold change threshold
      prevGeneSelection.current = geneSelection; // Update gene selection
    } else {
      console.log("No changes detected. Skipping data processing.");
    }
  };

  const handleBaseStudyChange = (e) => {
    const baseStudy = e.target.value;
    console.log("handleBaseStudyChange triggered.");
    console.log("New base study selected:", baseStudy);

    // Update base study state
    setSelectedBaseStudy(baseStudy);
    console.log("Updated selected base study state:", baseStudy);

    // Reset filters, ensuring the base study is marked as "Must"
    setSelectedFilters((prevFilters) => {
      const newFilters = {
        ...Object.keys(prevFilters).reduce(
          (acc, study) => ({
            ...acc,
            [study]: study === baseStudy ? "Must" : "", // Set only base study to "Must"
          }),
          {}
        ),
      };
      console.log("Updated filters:", newFilters);
      return newFilters;
    });

    // Reset thresholds
    setSignificanceThreshold(1.0);
    setFoldChangeThreshold(1.0);
    console.log("Thresholds reset to initial values (1.0).");

    // Notify parent or other component about filter changes
    onFilterChange(baseStudy, "Must");
    console.log("Notified parent component about filter change.");
  };

  const handleCheckboxChange = (study, value) => {
    setSelectedFilters((prevFilters) => {
      const newFilters = {
        ...prevFilters,
        [study]: prevFilters[study] === value ? "" : value, // Toggle: empty if already selected
      };
      onFilterChange(study, newFilters[study]); // Notify main component
      return newFilters;
    });
  };

  return (
    <Box p="4" maxW="900px" h="100%" className="mx-auto">
      <Grid
        bg="#f5f5f5"
        p="4"
        borderRadius="8px"
        templateColumns="repeat(2, 1fr)"
        gap="4"
        mb="4"
      >
        {/* Comparison Column */}
        <FormControl w="100%">
          <FormLabel fontWeight="bold" color="gray.700">Comparison</FormLabel>
          <Select placeholder="Select Comparison" w="100%">
            <option value="before-vs-after">Before vs After</option>
          </Select>
        </FormControl>

        {/* Base Study Column */}
        <FormControl w="100%">
          <FormLabel fontWeight="bold" color="gray.700">Select Base Study</FormLabel>
          <Flex align="center">
            <Select
              placeholder="Select Base Study"
              value={selectedBaseStudy}
              onChange={handleBaseStudyChange}
              w="80%"
            >
              {studies.map((study, index) => (
                <option key={index} value={study}>
                  {study}
                </option>
              ))}
            </Select>
            <Button
              ml="2"
              size="sm"
              bg="red.500" // Set the initial background color to a red shade
              color="white"
              _hover={{ bg: "red.600" }} // Change background color to a darker red on hover
              onClick={onOpen}
            >
              FAQ's
            </Button>
            {/* Add FAQModal component */}
            <FAQModal isOpen={isOpen} onClose={onClose} />
          </Flex>
        </FormControl>
      </Grid>

      {/* Conditional rendering for subsequent sections */}
      {selectedBaseStudy && (
        <Grid templateColumns="repeat(3, 1fr)" gap="4">
          {/* Studies to Overlay Column */}
          <Box bg="#f5f5f5" p="4" borderRadius="8px">
            <Text mb="4" fontWeight="bold" color="gray.700">
              Select Studies to Overlay
            </Text>
            <Table variant="simple" size="sm">
              <Thead
                sx={{
                  bg: "blue.500",
                  color: "white",
                }}
              >
                <Tr>
                  <Th color="white" fontSize="xs">
                    Studies
                  </Th>
                  <Th color="white" fontSize="xs">
                    Must
                  </Th>
                  <Th color="white" fontSize="xs">
                    Maybe
                  </Th>
                  <Th color="white" fontSize="xs">
                    Not
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {studies
                  .filter((study) => study !== selectedBaseStudy)
                  .map((study, index) => (
                    <Tr key={index}>
                      <Td fontSize="xs">{study}</Td>
                      <Td>
                        <Checkbox
                          size="md"
                          colorScheme="red"
                          isChecked={selectedFilters[study] === "Must"}
                          onChange={() => handleCheckboxChange(study, "Must")}
                        />
                      </Td>
                      <Td>
                        <Checkbox
                          size="md"
                          colorScheme="red"
                          isChecked={selectedFilters[study] === "Maybe"}
                          onChange={() => handleCheckboxChange(study, "Maybe")}
                        />
                      </Td>
                      <Td>
                        <Checkbox
                          size="md"
                          colorScheme="red"
                          isChecked={selectedFilters[study] === "Not"}
                          onChange={() => handleCheckboxChange(study, "Not")}
                        />
                      </Td>
                    </Tr>
                  ))}
              </Tbody>
            </Table>
          </Box>

          {/* Thresholds Column */}
          <Box bg="#f5f5f5" p="4" borderRadius="8px" height="30vh">
            <Text mb="4" fontWeight="bold" color="gray.700">
              Thresholds
            </Text>
            <Box mb="4">
              <Text mb="2" fontSize="sm">
                -log₁₀ p-value Threshold
              </Text>
              <Slider
                min={minPValue}
                max={maxPValue}
                step={0.1}
                value={tempSignificanceThreshold}
                onChange={(value) => setTempSignificanceThreshold(value)} // Update temp state
                size="sm"
              >
                <SliderMark
                  value={tempSignificanceThreshold}
                  mt="1"
                  ml="-2.5"
                  fontSize="sm"
                >
                  {tempSignificanceThreshold}
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>

              <Text mb="2" mt="4" fontSize="sm">
                log₂ FC Threshold
              </Text>
              <Slider
                min={minLog2FoldChange}
                max={maxLog2FoldChange}
                step={0.1}
                value={tempFoldChangeThreshold}
                onChange={(value) => setTempFoldChangeThreshold(value)}
                size="sm"
              >
                <SliderMark
                  value={tempFoldChangeThreshold}
                  mt="1"
                  ml="-2.5"
                  fontSize="sm"
                >
                  {tempFoldChangeThreshold}
                </SliderMark>
                <SliderTrack>
                  <SliderFilledTrack />
                </SliderTrack>
                <SliderThumb />
              </Slider>
            </Box>
          </Box>

          {/* Gene Selection Column */}
          <Box bg="#f5f5f5" p="4" borderRadius="8px" height="15vh">
            <FormControl w="100%">
              <FormLabel fontWeight="bold" color="gray.700">
                Show Overlayed Genes
              </FormLabel>
              <Select
                value={geneSelection}
                onChange={(e) => {
                  setGeneSelection(e.target.value);
                  onGeneFilterChange(e.target.value);
                }}
                w="100%"
                size="sm"
              >
                <option value="all">All Genes</option>
                <option value="upregulated">Upregulated Genes</option>
                <option value="downregulated">Downregulated Genes</option>
              </Select>
            </FormControl>
          </Box>
          <Button
            onClick={handleShowVolcanoPlot}
            colorScheme="blue"
            isDisabled={!selectedBaseStudy}
          >
            Show Volcano Plot
          </Button>
        </Grid>
      )}
    </Box>
  );
};

export default FilterComponent;
