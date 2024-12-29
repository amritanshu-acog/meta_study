import React, { useEffect, useState } from "react";
import {
  HStack,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Slider,
  SliderMark,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  Box,
  Button,
  Heading,
} from "@chakra-ui/react";

const EnrichmentAnalysisFilter = ({
  cutoff,
  setCutoff,
  geneSet,
  setGeneSet,
  applyFilters,
}) => {
  const [geneSets, setGeneSets] = useState([]);

  useEffect(() => {
    const fetchGeneSets = async () => {
      try {
        const res = await fetch(
          "https://scverse-api-dev-stable2.own4.aganitha.ai:8443/ea/filters"
        );
        const data = await res.json();
        setGeneSets(data.gene_sets || []);
      } catch (err) {
        console.error("Error fetching gene sets:", err);
      }
    };

    fetchGeneSets();
  }, []);

  return (
    <Box
      w="60%"
      p={2}
      alignItems="center"
      align="center"
      bg="#f5f5f5"
      borderRadius="md"
      justify="center"
      boxShadow="sm"
      borderWidth="1px"
      borderColor="gray.200"
    >
      <HStack w="90%">
        <Box flex="1">
          <Heading as="h4" size="sm" mb={2} color="gray.700">
            Cutoff (AdjPVal)
          </Heading>
          <Slider
            min={0.0}
            max={0.1}
            step={0.01}
            value={cutoff}
            onChange={(v) => setCutoff(v)}
          >
            <SliderMark value={cutoff} mt="1" ml="-2.5" fontSize="sm">
              {cutoff.toFixed(2)}
            </SliderMark>
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
        </Box>

        <Box flex="1">
          <Heading as="h4" size="sm" mb={2} color="gray.700">
            Gene Set
          </Heading>
          <FormControl>
            <ChakraSelect
              bg="white"
              borderColor="gray.300"
              fontSize="sm"
              value={geneSet || ""}
              onChange={(e) => setGeneSet(e.target.value)}
              placeholder="Select Gene Set"
            >
              {geneSets.map((geneSet) => (
                <option value={geneSet} key={geneSet}>
                  {geneSet}
                </option>
              ))}
            </ChakraSelect>
          </FormControl>
        </Box>

        <Button
          p={4}
          colorScheme="blue"
          size="md"
          onClick={applyFilters} // Apply filters on button click
          alignSelf="flex-end"
        >
          Apply Filters
        </Button>
      </HStack>
    </Box>
  );
};

export default EnrichmentAnalysisFilter;
