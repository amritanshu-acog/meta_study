import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import FilterLayout from "./FilterLayout";

const PageWithFilterLayout = ({ filters, children }) => {
  return (
    <Flex height="calc(100vh - 75px)" overflow="hidden">
      <FilterLayout>{filters}</FilterLayout>
      <Box flex={1} overflowY="auto" p={6}>
        {children}
      </Box>
    </Flex>
  );
};

export default PageWithFilterLayout;
