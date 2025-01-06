import React from "react";
import {
  Box,
  Flex,
  Text,
  RadioGroup,
  Radio,
  Button,
  Stack,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Heading,
  Icon,
  Select as ChakraSelect,
  FormLabel,
} from "@chakra-ui/react";
import Select from "react-select";

import { FaFilter } from "react-icons/fa";
const UmapFilter = ({
  filters,
  samples,
  setSamples,
  selectedSplitBy,
  setSelectedSplitBy,
  numberOfUMAPs,
  setNumberOfUMAPs,
  umapSplits,
  setUmapSplits,
  applyFilters,
}) => {
  function initializeSplits(num) {
    const existingSplits = { ...umapSplits };
    for (let i = 0; i < num; i++) {
      if (!existingSplits[`split_${i + 1}`]) {
        existingSplits[`split_${i + 1}`] = { cohort: "", sample: [] };
      }
    }
    return Object.fromEntries(Object.entries(existingSplits).slice(0, num));
  }
  const handleSplitByChange = (e) => {
    const selectedKey = e.target.value;
    setSelectedSplitBy(selectedKey);
    setSamples([]);
    setNumberOfUMAPs(1);
    setUmapSplits(initializeSplits(1));

    const selectedFilter = filters.find((f) => f.split_by_key === selectedKey);
    if (selectedFilter && selectedFilter.split_by_vals_vs_samples.length > 0) {
      setSamples(selectedFilter.split_by_vals_vs_samples);
    }
  };

  const handleUMAPChange = (value) => {
    setNumberOfUMAPs(value);
  };

  const handleSplitChange = (splitKey, value) => {
    const samplesForValue =
      samples.find((item) => item.split_by_val === value)?.samples || [];

    setUmapSplits((prevSplits) => ({
      ...prevSplits,
      [splitKey]: {
        splitByValue: value,
        sample: samplesForValue,
      },
    }));
  };

  const handleSampleChange = (splitKey, selectedOptions) => {
    const selectedSamples = selectedOptions
      ? selectedOptions.map((option) => option.value)
      : [];

    setUmapSplits((prevSplits) => ({
      ...prevSplits,
      [splitKey]: {
        ...prevSplits[splitKey],
        sample: selectedSamples,
      },
    }));
  };

  return (
    <Box
      width={{ base: "100%", md: "15%" }} // Use responsive widths for different screen sizes
      p={4}
      borderRight="1px dotted #d9d9d9"
      fontFamily="Lexend Deca, sans-serif"
    >
      <Heading
        size="sm"
        className="flex items-center gap-2 mb-2 text-sm" // Tailwind: Adjust text size to smaller
      >
        <Icon as={FaFilter} color="#3182ce" />
        <p className="text-[22px] text-black font-normal">Filters</p>
      </Heading>

      <Box mt={4}>
        <FormLabel>
          <Text
            fontSize="sm"
            color="#a1a1a1"
            fontWeight="400"
            className="flex items-center"
          >
            Split By :
          </Text>
        </FormLabel>
        <ChakraSelect
          value={selectedSplitBy}
          onChange={handleSplitByChange}
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
        >
          <option value="">- Split By -</option>
          {filters.map((filter) => (
            <option key={filter.split_by_key} value={filter.split_by_key}>
              {filter.split_by_key}
            </option>
          ))}
        </ChakraSelect>
      </Box>

      {samples.length > 0 && (
        <>
          <Box mt={4}>
            <Text fontSize="sm" color="#a1a1a1">
              Number of UMAPs:
            </Text>
            <Box
              className="flex items-center rounded-full border border-gray-300 mt-2"
              px={3}
              py={1}
              width="auto"
            >
              <Text fontSize="sm" mr={2}>
                {" "}
                {numberOfUMAPs}
              </Text>
              <Slider
                aria-label="Number of UMAPs"
                defaultValue={numberOfUMAPs}
                min={1}
                max={samples.length}
                onChange={handleUMAPChange}
                colorScheme="red"
                className="flex-1"
                height="0.75rem"
              >
                <SliderTrack height="0.25rem">
                  {" "}
                  <SliderFilledTrack bg="blue.500" />
                </SliderTrack>
                <SliderThumb boxSize={3} /> {/* Reduced thumb size */}
              </Slider>
            </Box>
          </Box>

          {Array.from({ length: numberOfUMAPs }, (_, index) => (
            <Box mt={4} key={`split_${index + 1}`}>
              <Text fontSize="sm" color="#a1a1a1">
                Split {index + 1}:
              </Text>

              <Box
                mt={2}
                p={1}
                border="#d9d9d9"
                borderWidth="1px"
                borderRadius="10px"
                bg="#f7f7f7"
              >
                <RadioGroup
                  onChange={(value) =>
                    handleSplitChange(`split_${index + 1}`, value)
                  }
                  value={umapSplits[`split_${index + 1}`]?.splitByValue || ""}
                >
                  <Stack
                    direction="column"
                    spacing={2}
                    divider={<Box borderBottom="1px dotted #d9d9d9" />}
                  >
                    {samples.map(({ split_by_val }) => (
                      <Flex
                        key={split_by_val}
                        justify="space-between"
                        align="center"
                        px={2} // Added padding
                        py={0.5}
                      >
                        <Text
                          fontWeight="400" // Set font weight
                          color="#000000"
                          fontSize="sm"
                        >
                          {split_by_val}
                        </Text>
                        <Radio
                          value={split_by_val}
                          size="md"
                          sx={{
                            ".chakra-radio__control": {
                              borderColor: "#7b0000", // Set border color
                              _checked: {
                                bg: "transparent",
                                borderColor: "#7b0000", // Consistent color
                                color: "#7b0000",
                              },
                              _hover: {
                                bg: "transparent",
                                borderColor: "#7b0000", // Ensure hover has same color
                              },
                              transition: "background-color 0.3s",
                            },
                          }}
                        />
                      </Flex>
                    ))}
                  </Stack>
                </RadioGroup>
              </Box>
              {umapSplits[`split_${index + 1}`]?.splitByValue && (
                <Box
                  mt={2}
                  style={{
                    borderRadius: "18px",
                  }}
                >
                  <Text fontSize="xs" color="#a1a1a1" className="mb-2">
                    Sample Data:
                  </Text>
                  <Select
                    isMulti
                    closeMenuOnSelect={false}
                    className="basic-multi-select text-sm"
                    placeholder="- Sample Data -"
                    value={(umapSplits[`split_${index + 1}`]?.sample || []).map(
                      (sample) => ({
                        value: sample,
                        label: sample,
                      })
                    )}
                    options={samples
                      .find(
                        ({ split_by_val }) =>
                          split_by_val ===
                          umapSplits[`split_${index + 1}`]?.splitByValue
                      )
                      ?.samples.map((sample) => ({
                        value: sample,
                        label: sample,
                      }))}
                    onChange={(selectedOptions) => {
                      if (selectedOptions.length > 0) {
                        handleSampleChange(
                          `split_${index + 1}`,
                          selectedOptions
                        );
                      }
                    }}
                    hideSelectedOptions={false}
                    styles={{
                      container: (provided) => ({
                        ...provided,
                        borderRadius: "18px",
                      }),
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "18px",
                        minHeight: "150px", // Increase the minHeight according to your needs
                        maxHeight: "150px",
                        overflowY: "auto",
                        fontSize: "small",
                      }),
                      valueContainer: (provided) => ({
                        ...provided,
                        maxHeight: "120px",
                        overflowY: "auto",
                      }),
                      multiValue: (base) => ({
                        ...base,
                        borderRadius: "18px",
                        backgroundColor: "#F5f5f7",
                        color: "#000000",
                      }),
                      multiValueLabel: (base) => ({
                        ...base,
                        color: "#000000",
                      }),
                      multiValueRemove: (base) => ({
                        ...base,
                        ":hover": {
                          backgroundColor: "#e5e5e5",
                          color: "#333333",
                        },
                      }),
                      menu: (provided) => ({
                        ...provided,
                        backgroundColor: "#b6b6b6",
                        maxHeight: "200px",
                        overflowY: "auto",
                      }),
                      option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isSelected
                          ? "#c2c2c2"
                          : "#e0e0e0",
                        color: "#000000",
                        ":hover": {
                          backgroundColor: "#c2c2c2",
                        },
                      }),
                    }}
                  />
                </Box>
              )}
            </Box>
          ))}
        </>
      )}

      <Button
        mt={6} // Reduced margin-top to make the button spacing smaller
        width="auto" // Adjust width to auto to make it smaller
        bg="#f7f7f7"
        color="#000000"
        borderRadius="20px"
        borderColor="#f7f7f7" // Match border color to background color to make border blend in
        borderWidth="1px"
        fontWeight="400" // Set the font weight to 400
        fontSize="md" // Default font size to make it larger and more visible
        py={1.5} // Adjust padding for better fit
        px={4} // Add padding to the sides to match the shape
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </Box>
  );
};

export default UmapFilter;
