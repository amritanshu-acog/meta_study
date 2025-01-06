import React from "react";
import { Box, Checkbox, Grid, HStack, Text, Switch } from "@chakra-ui/react";

const ScatterPlotLegend = ({
  labels,
  displayMode,
  selectedLabels,
  commonColorScale,
  setSelectedLabels,
  setDisplayMode,
  includeTable,
  scope = null, // Add the `scope` prop with a default value of `null`
}) => {
  const colorScale = commonColorScale;

  const toggleLabelSelection = (label) => {
    setSelectedLabels((prev) => {
      const updated = new Set(prev);
      if (updated.has(label)) {
        updated.delete(label);
      } else {
        updated.add(label);
      }
      return updated;
    });
  };

  const handleModeChange = () => {
    setDisplayMode((prevMode) =>
      prevMode === "legend" ? "selection" : "legend"
    );
    if (displayMode === "legend") {
      setSelectedLabels(new Set()); // Show all points in legend mode
    } else {
      setSelectedLabels(new Set());
    }
  };

  // Determine which labels to display based on scope
  const filteredLabels = scope
    ? labels.filter((label) => Array.isArray(scope) && scope.includes(label))
    : labels;

  return (
    <Box p={4} overflowX="auto" w="100%" className="border rounded-md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="flex-start"
        mt={2}
        maxW="1200px"
        w="100%"
      >
        {includeTable && (
          <HStack spacing={4} mb={6} align="center">
            <Text>Legend Mode</Text>
            <Switch
              isChecked={displayMode === "selection"}
              onChange={handleModeChange}
              colorScheme="gray"
            />
            <Text>Selection Mode</Text>
          </HStack>
        )}
      </Box>
      <Grid
        templateColumns={{
          base: "repeat(1, 1fr)",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
          lg: "repeat(4, 1fr)",
        }}
        gap={{ base: 2, md: 4 }}
      >
        {filteredLabels.map((label) => (
          <HStack
            key={label}
            spacing={2}
            align="center"
            cursor={displayMode === "selection" ? "pointer" : "default"}
            onClick={() =>
              displayMode === "selection" && toggleLabelSelection(label)
            }
          >
            {displayMode === "legend" && (
              <Box
                as="span"
                display="inline-block"
                w={4}
                h={4}
                borderRadius="md"
                bg={colorScale(label)}
                borderWidth={1}
                borderColor="gray.300"
                mr={2}
              />
            )}
            {displayMode === "selection" && (
              <Checkbox
                size="sm"
                mr={2}
                isChecked={selectedLabels.has(label)}
                onChange={() => toggleLabelSelection(label)}
                colorScheme="gray"
                borderColor={colorScale(label)}
                sx={{
                  "& .chakra-checkbox__control": {
                    borderColor: colorScale(label),
                    backgroundColor: selectedLabels.has(label)
                      ? colorScale(label)
                      : "transparent",
                  },
                  "& .chakra-checkbox__control::before": {
                    backgroundColor: colorScale(label),
                  },
                }}
              />
            )}
            <Text fontSize="sm">{label}</Text>
          </HStack>
        ))}
      </Grid>
    </Box>
  );
};

export default ScatterPlotLegend;
