import React from "react";
import { Flex, Box, Text } from "@chakra-ui/react";

const Legend = ({ colorScale, groups }) => {
  return (
    <Flex direction="row" alignItems="center" wrap="wrap">
      {groups.map((group, idx) => (
        <Flex key={idx} alignItems="center" mr={4} mb={2}>
          <Box
            width="20px"
            height="20px"
            backgroundColor={colorScale(group)}
            mr="8px" // Add spacing between the color box and text
          />
          <Text>{group}</Text>
        </Flex>
      ))}
    </Flex>
  );
};

export default Legend;
