import React, { useEffect, useState } from "react";
import {
  VStack,
  Heading,
  Icon,
  FormControl,
  FormLabel,
  Select as ChakraSelect,
  Button,
  Box,
  Slider,
  SliderMark,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
} from "@chakra-ui/react";
import { FaFilter } from "react-icons/fa";

const EnrichmentFilter = ({
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
        const res = await fetch(`/api/ea/filters`);
        const data = await res.json();
        setGeneSets(data.gene_sets);
      } catch (err) {
        console.error("Error fetching gene sets:", err);
      }
    };

    fetchGeneSets();
  }, []);

  return (
    <VStack
      w="15%"
      p={4}
      borderWidth={1}
      borderColor="gray.100"
      borderRadius="xl"
      borderStyle="dotted"
      align="stretch"
      spacing={4}
      className="text-xs"
      overflowY="scroll"
      borderRight="1px dotted #d9d9d9"
      borderTopRightRadius="0"
      borderBottomRightRadius="0"
    >
      <Heading
        size="sm"
        className="flex items-center gap-2 mb-2 text-sm" // Tailwind: Adjust text size to smaller
      >
        <Icon as={FaFilter} color="#3182ce" />
        <p className="text-[22px] text-black font-normal">Filters</p>
      </Heading>
      <Box>
        <FormLabel>
          <span className="text-sm font-semibold">
            Select Cutoff &#40;AdjPVal&#41; :
          </span>
        </FormLabel>
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
      <FormControl>
        <FormLabel>
          <span className="text-sm font-semibold">Select Gene Set :</span>
        </FormLabel>
        <ChakraSelect
          bg="white"
          borderColor="#B3B3B3"
          borderRadius="20px"
          fontSize="sm"
          value={geneSet || ""}
          onChange={(e) => setGeneSet(e.target.value)}
        >
          <option value="">- Select Gene Set -</option>
          {geneSets.map((geneSet) => (
            <option value={geneSet} key={geneSet}>
              {geneSet}
            </option>
          ))}
        </ChakraSelect>
      </FormControl>

      <Button
        mt={4}
        color="black"
        variant="solid"
        bg="#F5F5F5"
        fontSize="sm"
        borderRadius="20px"
        onClick={applyFilters}
      >
        Apply Filters
      </Button>
    </VStack>
  );
};

export default EnrichmentFilter;
