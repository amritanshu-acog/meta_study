import React from "react";
import { Spinner, Center, Box, Text } from "@chakra-ui/react";

const Loader = ({ currentStudy }) => {
  return (
    <Center h="100vh">
      <Box textAlign="center">
        <Spinner size="xl" color="blue.500" />
        <Text mt={4}>Loading plot data...</Text>
        {currentStudy && (
          <Text mt={2} fontSize="lg" fontWeight="medium" color="gray.600">
            Processing study: <strong>{currentStudy}</strong>
          </Text>
        )}
      </Box>
    </Center>
  );
};

export default Loader;
