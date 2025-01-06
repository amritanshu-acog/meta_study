import React from "react";
import { Spinner, Center, Box } from "@chakra-ui/react";

const Loader = () => {
  return (
    <Center h="90vh">
      <Box className="flex flex-col gap-2 justify-center items-center">
        <Spinner size="xl" color="blue.500" />
        <p>Loading...</p>
      </Box>
    </Center>
  );
};

export default Loader;
