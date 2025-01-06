import React, { useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Icon,
  IconButton,
  Collapse,
  HStack,
  Button,
} from "@chakra-ui/react";
import { FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const FilterLayout = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Box
      height="calc(100vh - 75px)"
      borderRight="1px"
      borderColor="gray.200"
      transition="all 0.3s"
      width={isCollapsed ? "70px" : "240px"}
    >
      <VStack align="stretch" height="100%">
        <Box
          p={2}
          paddingBlock={4}
          borderBottomWidth={1}
          borderColor="gray.200"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <HStack>
            <Icon as={FaFilter} color="blue.500" />
            {!isCollapsed && (
              <Heading size="sm" display="flex" alignItems="center" gap={2}>
                Filters
              </Heading>
            )}
          </HStack>

          <IconButton
            aria-label={isCollapsed ? "Expand filters" : "Collapse filters"}
            icon={isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
        </Box>
        <Collapse in={!isCollapsed} animateOpacity>
          <Box overflowY="auto" height="calc(100vh - 75px)" p={4}>
            {children}
          </Box>
        </Collapse>
      </VStack>
    </Box>
  );
};

export default FilterLayout;
