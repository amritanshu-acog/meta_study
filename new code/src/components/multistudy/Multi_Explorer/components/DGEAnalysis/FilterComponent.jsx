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
  useDisclosure,
  Flex,
} from "@chakra-ui/react";
import FAQModal from "./FAQModal";

const FilterComponent = ({
  studyNames,
  //  studies,
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
    studyNames.reduce((acc, study) => ({ ...acc, [study]: "" }), {})
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

  const [pct1, setPct1] = useState(20);
  const [pct2, setPct2] = useState(20);
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

    // Update base study state
    setSelectedBaseStudy(baseStudy);

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
      return newFilters;
    });

    // Reset thresholds
    setSignificanceThreshold(1.0);
    setFoldChangeThreshold(1.0);

    // Notify parent or other component about filter changes
    onFilterChange(baseStudy, "Must");
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
    <Box
      p="4"
      maxW="900px"
      h="100%"
      justifyContent="center"
      alignItems="center"
      className="mx-auto"
    >
      <Flex justifyContent="center" mb="4">
        <FormControl
          bg="#f5f5f5"
          p="4"
          borderRadius="8px"
          w="100%"
          maxW="400px"
          boxShadow="sm"
        >
          <FormLabel fontWeight="bold" color="gray.700" textAlign="center">
            Select Base Study
          </FormLabel>
          <Flex align="center" justifyContent="space-between">
            <Select
              placeholder="Select Base Study"
              value={selectedBaseStudy}
              onChange={handleBaseStudyChange}
              w="80%"
            >
              {studyNames.map((study, index) => (
                <option key={index} value={study}>
                  {study}
                </option>
              ))}
            </Select>
            <Button
              ml="2"
              size="sm"
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              onClick={onOpen}
            >
              FAQ's
            </Button>
            {/* Add FAQModal component */}
            <FAQModal isOpen={isOpen} onClose={onClose} />
          </Flex>
        </FormControl>
      </Flex>

      {/* Conditional rendering for subsequent sections */}
      {selectedBaseStudy && (
        <Grid templateColumns="repeat(3, 1fr)" gap="4">
          {/* Studies to Overlay Column */}
          <Box bg="#f5f5f5" p="4" borderRadius="8px" height="auto">
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
                {studyNames
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
          <Box bg="#f5f5f5" p="4" borderRadius="8px" height="auto">
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

          {/* Gene Selection and Percentage Expression */}
          <Box height="auto">
            {/* Gene Selection */}
            <FormControl bg="#f5f5f5" p="4" borderRadius="8px" w="100%" mb="4">
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

            {/* Percentage Filter */}
            <FormControl bg="#f5f5f5" p="4" borderRadius="8px">
              <FormLabel fontWeight="bold" color="gray.700">
                Set Percentage Expression
              </FormLabel>
              <Flex
                direction="row"
                align="center"
                justify="space-between"
                gap={4}
              >
                {/* Box for Pct 1 */}
                <Box w="45%">
                  <FormControl>
                    <FormLabel color="gray.700">Pct 1</FormLabel>
                    <Slider
                      min={0}
                      max={100}
                      value={pct1}
                      onChange={setPct1}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                </Box>

                {/* Box for Pct 2 */}
                <Box w="45%">
                  <FormControl>
                    <FormLabel color="gray.700">Pct 2</FormLabel>
                    <Slider
                      min={0}
                      max={100}
                      value={pct2}
                      onChange={setPct2}
                      colorScheme="blue"
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb />
                    </Slider>
                  </FormControl>
                </Box>
              </Flex>
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
