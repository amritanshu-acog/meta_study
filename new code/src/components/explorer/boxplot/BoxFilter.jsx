import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import ParentComponent from "./gene/GeneParentComponent";
import CellParentComponent from "./cell/CellParentComponent";
import AsyncSelect from "react-select/async";
import { FaDna, FaDisease } from "react-icons/fa";

import {
  Box,
  Button,
  Heading,
  Icon,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Input,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";
import { useStudyNode } from "../../../pages/explorer/StudyNodeContext";

const BoxFilter = () => {
  const { nodeId, breadcrumbElement } = useStudyNode();

  const [data, setData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [selectedValues, setSelectedValues] = useState([]);
  const [selectedXAxisLabel, setSelectedXAxisLabel] = useState("");
  const [xAxisOptions, setXAxisOptions] = useState([]);
  const [selectedXAxisValues, setSelectedXAxisValues] = useState([]);
  const [statAnnotationPairs, setStatAnnotationPairs] = useState([]);
  const [selectedStatPairs, setSelectedStatPairs] = useState([
    // { label: "healthy,diseased", value: "healthy,diseased" },
  ]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cellData, setCellData] = useState(null);
  const [geneKeys, setGeneKeys] = useState(["FCGR3A"]);
  const [geneData, setGeneData] = useState(null);
  const [searchGeneOptions, setSearchGeneOptions] = useState([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    if (data) {
      // Check if data is available and has genes
      const geneList = data.genes || [];

      // Transform geneList to search options
      const options = geneList.map((gene) => ({
        value: gene,
        label: gene,
      }));

      // Set the transformed options state
      setSearchGeneOptions(options);
    }
  }, [data]);

  const filterGenes = (inputValue) => {
    return searchGeneOptions.filter((gene) =>
      gene.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const loadOptions = (inputValue, callback) => {
    setTimeout(() => {
      callback(filterGenes(inputValue));
    }, 1000);
  };

  useEffect(() => {
    const fetchData = async () => {
      const apiUrl = `/api/${nodeId}/boxplots/filters`;
      try {
        const response = await axios.get(apiUrl);

        if (response.statusText !== "OK") {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = response.data;

        setData(data);

        // Set default split_by and x_axis values based on response
        const defaultCategoryKey = Object.keys(data.split_by_kvs)[0]; // Default for category
        setSelectedCategory(defaultCategoryKey);

        setSelectedValues(
          data.split_by_kvs[defaultCategoryKey].map((val) => ({
            label: val,
            value: val,
          }))
        );
        const xAxisDefaultKey = Object.keys(data.x_axis_kvs)[0];
        setSelectedXAxisLabel(xAxisDefaultKey); // Default for x-axis key

        setSelectedXAxisValues(
          data.x_axis_kvs[xAxisDefaultKey].map((val) => ({
            label: val,
            value: val,
          }))
        );

        setSelectedStatPairs(() => {
          const result = [];
          const arr = data.split_by_kvs[defaultCategoryKey];

          for (let i = 0; i < arr.length; i++) {
            for (let j = i + 1; j < arr.length; j++) {
              const pair = `${arr[i]},${arr[j]}`;
              result.push({ label: pair, value: pair });
            }
          }

          return [result[0]];
        });

        setInitialLoadComplete(true); // Set flag to true after setting defaults
      } catch (err) {
        setError(err.message);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  // Use a separate useEffect to trigger handleApplyFilters after initial data load
  useEffect(() => {
    if (initialLoadComplete) {
      handleApplyFilters(); // Call your function once defaults are set
      applyGeneFilter();
    }
  }, [initialLoadComplete]);

  useEffect(() => {
    if (data && selectedCategory && data.split_by_kvs[selectedCategory]) {
      setCategoryOptions(
        data.split_by_kvs[selectedCategory].map((value) => ({
          label: value,
          value,
        }))
      );
    } else {
      setCategoryOptions([]);
    }
  }, [selectedCategory, data]);

  useEffect(() => {
    if (data && selectedXAxisLabel && data.x_axis_kvs[selectedXAxisLabel]) {
      const options = data.x_axis_kvs[selectedXAxisLabel].map((value) => ({
        label: value,
        value,
      }));
      setXAxisOptions(options);
      setSelectedXAxisValues(options); // Select all by default
    } else {
      setXAxisOptions([]);
      setSelectedXAxisValues([]);
    }
  }, [selectedXAxisLabel, data]);

  useEffect(() => {
    if (selectedValues.length > 1) {
      const pairs = [];
      const seen = new Set();

      for (let i = 0; i < selectedValues.length; i++) {
        for (let j = i + 1; j < selectedValues.length; j++) {
          const pair = [selectedValues[i].value, selectedValues[j].value];
          pair.sort(); // Sort to maintain consistent order
          const pairString = pair.join(",");

          if (!seen.has(pairString)) {
            pairs.push({ label: pairString, value: pairString });
            seen.add(pairString);
          }
        }
      }

      setStatAnnotationPairs(pairs);
    } else {
      setStatAnnotationPairs([]);
    }
  }, [selectedValues]);

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setSelectedValues([]);
    setSelectedStatPairs([]);
  };

  // Function that handles applying the selected filters and fetching data

  const handleApplyFilters = async () => {
    if (!data) return;

    const params = {
      split_by_key: selectedCategory || Object.keys(data.split_by_kvs)[0],
      x_axis_key: selectedXAxisLabel || data.x_axis_default_key,
      proportion_type: "global",
      split_by_vals: JSON.stringify(data.split_by_kvs[selectedCategory]),
      x_axis_vals: JSON.stringify(
        selectedXAxisValues.map((option) => option.value)
      ),
      statannotation_pairs: JSON.stringify(
        selectedStatPairs.map((option) => option.value.split(","))
      ),
    };

    setLoading(true);

    const apiUrl = `/api/${nodeId}/boxplots/cell-proportions`;
    try {
      const response = await axios.get(apiUrl, { params });
      setCellData(response.data);
    } catch (error) {
      console.error("API Call Error:", error.response?.data || error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const applyGeneFilter = async () => {
    try {
      const params = {
        x_axis_key: selectedXAxisLabel || "singleR_label",
        split_by_key: selectedCategory || "cohort",
        gene_keys: JSON.stringify(geneKeys),
        mode: "split",
        split_by_vals: JSON.stringify(
          selectedValues.map((option) => option.value)
        ),
        x_axis_vals: JSON.stringify(
          selectedXAxisValues.map((option) => option.value)
        ),
        statannotation_pairs: JSON.stringify(
          selectedStatPairs.map((option) => option.value.split(","))
        ),
      };

      const apiUrl = `/api/${nodeId}/boxplots/gene-expression`;
      const response = await axios.get(apiUrl, {
        params,
      });

      setGeneData(response.data);
    } catch (error) {
      console.error(
        "Error fetching gene data:",
        error.response || error.message
      );
    }
  };

  const handleValueChange = (selectedOptions) => {
    setSelectedValues(selectedOptions);
  };

  const split_prop = selectedValues.map((option) => option.value);

  const handleXAxisLabelChange = (event) => {
    setSelectedXAxisLabel(event.target.value);
  };

  const handleXAxisValuesChange = (selectedOptions) => {
    setSelectedXAxisValues(selectedOptions);
  };

  // Updated handler function to correctly set the state
  const handleStatPairsChange = (selectedOptions) => {
    if (Array.isArray(selectedOptions)) {
      // Ensure any updates maintain the correct structure
      // Map over the selectedOptions to create an array of the same format
      setSelectedStatPairs(
        selectedOptions.map((option) => ({
          label: option.label,
          value: option.value,
        }))
      );
    }
  };

  // if (loading) {
  //   return <Text>Loading...</Text>;
  // }

  if (error) {
    return <Text color="red.500">Error: {error}</Text>;
  }

  if (!data || (!data.split_by_kvs && !data.x_axis_kvs)) {
    return <Text>Loading...</Text>;
  }

  return (
    <Box display="flex" p={0} px={0} className="h-screen">
      {/* Left Column */}

      <VStack
        w="15%"
        p={4}
        borderWidth={1}
        borderColor="gray.100"
        borderStyle="dotted"
        align="flex-start"
        spacing={4}
        className="text-xs" // Tailwind for smaller text
      >
        <Heading
          size="sm"
          className="flex items-center gap-2 mb-2 text-sm" // Tailwind: Adjust text size to smaller
        >
          <Icon as={FaFilter} color="#3182ce" />
          <p className="text-[22px] text-black font-normal">Filters</p>
        </Heading>

        {/* Select Category Section */}
        <FormControl>
          <FormLabel>
            <Text
              fontSize="sm"
              color="#a1a1a1"
              fontWeight="400"
              className="flex items-center"
            >
              Select Category :
            </Text>
          </FormLabel>
          <ChakraSelect
            value={selectedCategory}
            onChange={handleCategoryChange}
            bg="white"
            borderColor="#B3B3B3"
            borderRadius="20px"
            fontSize="sm"
          >
            <option value="">- Select Category -</option>

            {Object.keys(data.split_by_kvs).map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </ChakraSelect>
        </FormControl>

        {/* Conditionally Render Category Values Section */}
        {selectedCategory && (
          <FormControl>
            <FormLabel>
              <Text
                fontSize="sm"
                color="#a1a1a1"
                fontWeight="400"
                className="flex items-center"
              >
                {selectedCategory} Values:
              </Text>
            </FormLabel>
            <Select
              isMulti
              value={selectedValues}
              onChange={handleValueChange}
              options={categoryOptions}
              closeMenuOnSelect={false}
              className="basic-multi-select text-sm"
              classNamePrefix="select"
              styles={{
                container: (provided) => ({
                  ...provided,
                  borderRadius: "18px",
                }),
                control: (provided) => ({
                  ...provided,
                  borderRadius: "18px",
                  minHeight: "36px",
                  fontSize: "small",
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
                  backgroundColor: state.isSelected ? "#c2c2c2" : "#e0e0e0",
                  color: "#000000",
                  ":hover": {
                    backgroundColor: "#c2c2c2",
                  },
                }),
              }}
            />
          </FormControl>
        )}

        {/* Select X-axis Label Section */}

        <FormControl>
          <FormLabel>
            <Text
              fontSize="sm"
              color="#a1a1a1"
              fontWeight="400"
              className="flex items-center"
            >
              X-axis label:
            </Text>
          </FormLabel>

          <ChakraSelect
            value={selectedXAxisLabel}
            onChange={handleXAxisLabelChange}
            bg="white"
            borderColor="#B3B3B3"
            borderRadius="20px" // Rounded corners
            fontSize="sm" // Decrease font size for X-axis select
          >
            <option value="">- Select X-axis Label -</option>{" "}
            {Object.keys(data.x_axis_kvs).map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </ChakraSelect>
        </FormControl>

        {/* X-Axis Values */}

        {selectedXAxisLabel && (
          <FormControl>
            <FormLabel>
              <Text
                fontSize="sm"
                color="#a1a1a1"
                fontWeight="400"
                className="flex items-center"
                overflow="scroll"
              >
                {selectedXAxisLabel} Values:
              </Text>
            </FormLabel>
            <Select
              isMulti
              value={selectedXAxisValues}
              onChange={handleXAxisValuesChange}
              options={xAxisOptions}
              className="basic-multi-select"
              closeMenuOnSelect={false}
              classNamePrefix="select"
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
                  backgroundColor: state.isSelected ? "#c2c2c2" : "#e0e0e0",
                  color: "#000000",
                  ":hover": {
                    backgroundColor: "#c2c2c2",
                  },
                }),
              }}
            />
          </FormControl>
        )}

        {/* Statannotation Pairs */}
        <FormControl>
          <FormLabel>
            <Text
              fontSize="sm"
              color="#a1a1a1"
              fontWeight="400"
              className="flex items-center"
            >
              Statannotation Pairs:
            </Text>
          </FormLabel>
          <Select
            isMulti
            value={selectedStatPairs}
            onChange={handleStatPairsChange}
            options={statAnnotationPairs}
            closeMenuOnSelect={false}
            className="basic-multi-select"
            classNamePrefix="select"
            styles={{
              container: (provided) => ({
                ...provided,
                borderColor: "#B3B3B3",
                borderRadius: "20px", // Rounded corners
              }),
            }}
          />
        </FormControl>

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
          onClick={handleApplyFilters}
        >
          Apply Filters
        </Button>
      </VStack>

      {/* Dotted Divider */}
      <Box borderLeft="1px dotted #d9d9d9" h="100vh" />

      {/* Right Column */}
      <Box w="85%" height="max-content">
        {/* <Box display="flex" justifyContent="center" margin="10px auto">
          <ExplorerNavbar />
        </Box> */}
        {breadcrumbElement}

        <Tabs variant="unstyled" isFitted mt={4} ml="0">
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
              color="black"
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

          <TabPanels>
            <TabPanel>
              {cellData && (
                <>
                  <CellParentComponent
                    cellData={cellData}
                    split_prop={split_prop}
                  />
                </>
              )}
            </TabPanel>
            <TabPanel>
              <Box className="flex justify-between items-center border rounded-md p-4 pb-8 border-b-0 rounded-bl-none rounded-br-none">
                {/* <Input
                  mt={4}
                  placeholder="Enter gene key"
                  value={geneKey}
                  onChange={(e) => setGeneKey(e.target.value)}
                /> */}

                <AsyncSelect
                  cacheOptions
                  loadOptions={loadOptions}
                  value={
                    geneKeys.length > 0
                      ? { value: geneKeys[0], label: geneKeys[0] }
                      : null
                  }
                  placeholder="Enter gene key"
                  isClearable
                  onChange={(selectedOption) => {
                    // Update `geneKeys` to contain either one value or be an empty array
                    setGeneKeys(selectedOption ? [selectedOption.value] : []);
                    applyGeneFilter();
                  }}
                  noOptionsMessage={() => "Start typing..."}
                  styles={{
                    control: (provided) => ({
                      ...provided,
                      width: "300px",
                      minWidth: "300px",
                      borderRadius: "18px",
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
              </Box>
              <Box>
                {geneData && (
                  <>
                    <ParentComponent
                      geneData={geneData}
                      split_prop={split_prop}
                    />
                  </>
                )}
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  );
};

export default BoxFilter;
