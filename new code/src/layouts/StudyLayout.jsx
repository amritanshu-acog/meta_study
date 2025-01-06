import React, { useState, useEffect } from "react";
import { Outlet, useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
import StudyNavbar from "../components/study/StudyNavbar";
import { getStudyData } from "../components/study/utils";
import PipelineFlowchartWrapper from "../components/study/PipelineFlowChart";

const StudyLayout = () => {
  const { studyId, nodeId } = useParams();
  const [study, setStudy] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [showPipeline, setShowPipeline] = useState(false);

  useEffect(() => {
    getStudyData(studyId, nodeId, setStudy, setActiveNode);
  }, [studyId, nodeId]);

  return (
    <Box>
      <StudyNavbar
        studyId={studyId}
        nodeId={nodeId}
        showPipeline={showPipeline}
        setShowPipeline={setShowPipeline}
      />

      <Box p={8} maxW="1200px" mx="auto" position="relative">
        {study && showPipeline && (
          <Box
            zIndex="10000"
            bgColor="white" // White background with transparency
          >
            <PipelineFlowchartWrapper
              studyId={studyId}
              pipelineTree={study.pipeline_tree}
              activeNodeId={nodeId}
              setShowPipeline={setShowPipeline}
            />
          </Box>
        )}
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudyLayout;
