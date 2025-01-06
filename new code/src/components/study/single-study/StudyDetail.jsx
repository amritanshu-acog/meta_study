import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Text } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const StudyDetail = () => {
  const { studyId } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);

  function getFirstActiveNode(node) {
    if (node.is_active) {
      return node;
    }

    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        const activeNode = getFirstActiveNode(child);
        if (activeNode) {
          return activeNode;
        }
      }
    }

    return null; // Return null if no active node is found
  }

  const navigateToSummary = (nodeId) =>
    navigate(`/study/${studyId}/summary/${nodeId}`);

  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await axios.get(`/api/studies/${studyId}`);
        console.log(response);
        setStudy(response.data);

        if (response.data.pipeline_tree) {
          const firstActiveNode = getFirstActiveNode(
            response.data.pipeline_tree
          );
          console.log(firstActiveNode);
          navigateToSummary(firstActiveNode.node_id);
        }
      } catch (error) {
        console.error("Failed to load study details:", error);
      }
    };
    fetchStudy();
  }, [studyId]);

  if (!study) return <Text>Loading...</Text>;

  return (
    <Box>
      <Box p={8} maxW="1200px" mx="auto">
        <Text as="h1" fontSize="33px" fontWeight="medium">
          {study.title}
        </Text>

        <Text
          fontSize="22px"
          fontWeight="medium"
          mt={16}
          mb={4}
          color={"#004664"}
        >
          Study Summary
        </Text>
        <Text mb={8} fontSize={"16px"}>
          {study.description}
        </Text>
      </Box>
    </Box>
  );
};

export default StudyDetail;
