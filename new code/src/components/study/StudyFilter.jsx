import React, { useEffect, useState } from "react";
import {
  Box,
  VStack,
  Checkbox,
  Text,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import Loader from "../Loader";
import Error from "../Error";

const StudyFilter = () => {
  const [filterContent, setFilterContent] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    async function getFilterContent() {
      try {
        const res = await axios.get("/api/study-filters");
        setFilterContent(res.data);
      } catch (error) {
        setError("Failed to fetch filter content");
      } finally {
        setLoading(false);
      }
    }

    getFilterContent();
  }, []);

  const handleCheckboxChange = (key, value) => {
    const params = new URLSearchParams(searchParams);

    // Get current values as an array
    const currentValues = params.getAll(key);

    // Toggle the value
    if (currentValues.includes(value)) {
      // If value is already present, remove it
      const newValues = currentValues.filter((v) => v !== value);
      params.delete(key);
      newValues.forEach((v) => params.append(key, v));
    } else {
      // Add the new value
      params.append(key, value);
    }

    setSearchParams(params);
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Error errorMessage={error} />;
  }

  return (
    <Box>
      <VStack alignItems="start" spacing={8}>
        {Object.entries(filterContent).map(([key, values]) => (
          <Box key={key}>
            <Text mb={2} fontWeight="semibold" color="var(--primary-color)">
              {key.toUpperCase().replace("_", " ")}
            </Text>
            {values.map((value) => (
              <FormControl
                key={value}
                display="flex"
                alignItems="center"
                mb="1"
                gap="1.5"
              >
                <Checkbox
                  id={value}
                  isChecked={searchParams.getAll(key).includes(value)}
                  onChange={() => handleCheckboxChange(key, value)}
                />
                <FormLabel
                  htmlFor={value}
                  mb="0"
                  userSelect="none"
                  cursor="pointer"
                >
                  {value}
                </FormLabel>
              </FormControl>
            ))}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default StudyFilter;
