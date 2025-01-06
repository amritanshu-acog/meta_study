import React, { useState, useEffect } from "react";
import Loader from "react-js-loader";
import { Box, Text, Center } from "@chakra-ui/react";

const EnrichmentHourGlass = ({ currentStudy }) => {
  const color = "rgb(255, 0, 0)"; // Loader color
  const bgColor = "rgb(123, 0, 0)"; // Background color
  const size = 100; // Loader size

  const loaderTypes = [
    "bubble-scale",
    "bubble-top",
    "bubble-loop",
    "hourglass",
  ];

  const [currentLoader, setCurrentLoader] = useState(loaderTypes[0]); // Initialize with the first loader
  const [index, setIndex] = useState(0); // State to track the current index in the loaderTypes array

  // Change loader type stepwise every 2 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % loaderTypes.length; // Move to the next loader, and restart after the last one
        setCurrentLoader(loaderTypes[nextIndex]); // Update the current loader type
        return nextIndex;
      });
    }, 3000); // 3000ms = 3 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array to run only once on mount

  return (
    <Center h="100vh">
      <Box textAlign="center" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          width={size} // Fixed width for the loader container
          height={size} // Fixed height for the loader container
        >
          {/* Stepwise loader */}
          {currentLoader && (
            <Loader
              type={currentLoader}
              bgColor={bgColor}
              color={color}
              size={size}
            />
          )}
        </Box>
        {/* Display the current study */}
        {currentStudy && (
          <Text mt={4} fontSize="md" color="gray.600">
            Processing study: <strong>{currentStudy}</strong>
          </Text>
        )}
      </Box>
    </Center>
  );
};

export default EnrichmentHourGlass;
