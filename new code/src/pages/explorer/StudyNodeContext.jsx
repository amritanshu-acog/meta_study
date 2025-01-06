// src/context/StudyContext.js
import React, { useState, useEffect, createContext, useContext } from "react";
import { useParams } from "react-router-dom";
import { getStudyData } from "../../components/study/utils";
import Breadcrumb from "../../components/BreadCrumb";
import { Box } from "@chakra-ui/react";

const StudyNodeContext = createContext();

export const StudyNodeProvider = ({ children }) => {
  const { studyId, nodeId } = useParams();
  const [study, setStudy] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [breadcrumbElement, setBreadcrumbElement] = useState(null);

  useEffect(() => {
    getStudyData(studyId, nodeId, setStudy, setActiveNode);
  }, [studyId, nodeId]);

  useEffect(() => {
    if (study && activeNode) {
      const breadcrumbItems = [
        { label: "All Studies", href: "/all-studies" },
        { label: study?.human_readable_study_id || "Loading..." },
        {
          label: activeNode?.node_label || "Loading...",
          href: `/study/${studyId}/summary/${nodeId}`,
        },
        { label: "Explorer" },
      ];
      setBreadcrumbElement(
        <Box pt={8} pl={6}>
          <Breadcrumb items={breadcrumbItems} />
        </Box>
      );
    }
  }, [study, activeNode, studyId, nodeId]);

  return (
    <StudyNodeContext.Provider value={{ nodeId, breadcrumbElement }}>
      {children}
    </StudyNodeContext.Provider>
  );
};

export const useStudyNode = () => useContext(StudyNodeContext);
