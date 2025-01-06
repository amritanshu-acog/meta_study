import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import ExplorerNavbarMulti from "../../components/ExplorerNavbarMulti";
import CellPropPage from "./CellPropPage";
import DgeAnalysisNew from "./DgeAnalysisNew";
import EnrichmentAnalysis from "./EnrichmentAnalysis";
import GeneExpressionPage from "./GeneExpressionPage";

const ExplorerPageMulti = () => {
  // Check for a stored active component in sessionStorage
  const initialComponent = sessionStorage.getItem("activeComponent") || "cellProportion";
  const [activeComponent, setActiveComponent] = useState(initialComponent);

  // Save the activeComponent to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  return (
    <Box>
      <ExplorerNavbarMulti
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

export default ExplorerPageMulti;
