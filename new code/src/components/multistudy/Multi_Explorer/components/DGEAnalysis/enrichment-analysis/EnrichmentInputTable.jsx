import React from "react";
import { VStack, HStack, Box } from "@chakra-ui/react";
import TableComponent from "../TableComponent";

const EnrichmentInputTable = ({ data }) => {
  // Destructure data into upregulated and downregulated arrays
  const { upregulated, downregulated } = data || {};

  // Count the number of upregulated and downregulated genes
  const upregulatedCount = upregulated ? upregulated.length : 0;
  const downregulatedCount = downregulated ? downregulated.length : 0;

  return (
    <HStack
      spacing={8}
      mt={12}
      justifyContent="center"
      alignItems="start"
      padding="0 20px"
      paddingBottom="50px"
    >
      {/* Downregulated Genes Section */}
      <VStack width="50%">
        <Box
          mb={4}
          textAlign="left"
          fontSize="20px"
          fontWeight="bold"
          color="rgba(0, 0, 255, 0.85)"
        >
          Down Regulated Genes: {downregulatedCount}
        </Box>
        <TableComponent data={downregulated || []} />
      </VStack>

      {/* Upregulated Genes Section */}
      <VStack width="50%">
        <Box
          mb={4}
          textAlign="left"
          fontSize="20px"
          fontWeight="bold"
          color="rgba(255, 0, 0, 0.85)"
        >
          Up Regulated Genes: {upregulatedCount}
        </Box>
        <TableComponent data={upregulated || []} />
      </VStack>
    </HStack>
  );
};

export default EnrichmentInputTable;


