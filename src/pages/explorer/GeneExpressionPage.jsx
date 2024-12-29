import React, { useEffect, useState } from "react";
import * as d3 from "d3";
import Select from "react-select";
import {
  Flex,
  Box,
} from "@chakra-ui/react";
import GeneExpressionFilter from "../../components/GeneExpression/GeneExpressionFilter";
import GeneExpression from "../../components/GeneExpression/GeneExpression";

const GeneExpressionPage = () => {
  const [formattedData, setFormattedData] = useState([]);

  const studyFiles = [
    "SLE-32-234.json",
    "MP-39-115.json",
    "KD-32-165.json",
    "JD-32-178.json",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const responses = await Promise.all(
          studyFiles.map((file) =>
            fetch(`/processed/${file}`).then((res) => res.json())
          )
        );

        // Format the data to match the desired structure
        const data = responses.map((studyData, index) => ({
          studyName: studyFiles[index].replace(".json", ""),
          celltypes: Object.entries(studyData).reduce(
            (acc, [celltype, data]) => {
              acc[celltype] = {
                gene: data.gene,
                pvalue: data.pvalue,
                log2FoldChange: data.log2FoldChange,
              };
              return acc;
            },
            {}
          ),
        }));

        setFormattedData(data);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Flex direction="row" w="100%">
      <Box
        height="100%" // Full screen height
        w="20%" // 20% width for the filter
        minW="200px"
        maxW="250px"
        display="flex"
        flexDirection="column"
        overflowY="auto"
        top="0" // Stick to the top of the page
        left="0" // Align to the left
      >
        <GeneExpressionFilter />
      </Box>

      <Box
        borderLeft="1px solid #ddd"
        h="100%"
        w="80%" // Takes the remaining space
      >
        <GeneExpression
          formattedData={formattedData}
        />
      </Box>
    </Flex>
  );
};

export default GeneExpressionPage;
