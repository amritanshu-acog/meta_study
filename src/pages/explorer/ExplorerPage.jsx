import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import ExplorerNavbar from "../../components/ExplorerNavbar";
import CellPropPage from "./CellPropPage";
import DgeAnalysisNew from "./DgeAnalysisNew";
import EnrichmentAnalysis from "./EnrichmentAnalysis";
import GeneExpressionPage from "./GeneExpressionPage";

const ExplorerPage = () => {
  // Check for a stored active component in sessionStorage
  const initialComponent = sessionStorage.getItem("activeComponent") || "cellProportion";
  const [activeComponent, setActiveComponent] = useState(initialComponent);

  // Save the activeComponent to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  return (
    <Box>
      <ExplorerNavbar
        activeComponent={activeComponent}
        setActiveComponent={setActiveComponent}
      />
      <Box>
        <Box display={activeComponent === "cellProportion" ? "block" : "none"}>
          <CellPropPage setActiveComponent={setActiveComponent} />
        </Box>
        <Box display={activeComponent === "geneExpression" ? "block" : "none"}>
          <GeneExpressionPage />
        </Box>
        <Box display={activeComponent === "dgeAnalysis" ? "block" : "none"}>
          <DgeAnalysisNew setActiveComponent={setActiveComponent} />
        </Box>
        <Box
          display={activeComponent === "enrichmentAnalysis" ? "block" : "none"}
        >
          <EnrichmentAnalysis />
        </Box>
      </Box>
    </Box>
  );
};

export default ExplorerPage;
