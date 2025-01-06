import React, { useState, useEffect } from "react";
import { Box } from "@chakra-ui/react";
import ExplorerNavbar from "../../components/ExplorerNavbar";
import BoxFilter from "../../components/explorer/boxplot/BoxFilter";
import DgeAnalysisPage from "./DgeAnalysisPage";
import EnrichmentAnalysisPage from "./EnrichmentAnalysisPage";
import UmapPage from "./UmapPage";
import { FaChartBar, FaBox, FaDna, FaFlask } from "react-icons/fa";
import { StudyNodeProvider } from "./StudyNodeContext";

const ExplorerPage = () => {
  // Check for a stored active component in sessionStorage
  const initialComponent = sessionStorage.getItem("activeComponent") || "umap";

  const [activeComponent, setActiveComponent] = useState(initialComponent);

  // Save the activeComponent to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem("activeComponent", activeComponent);
  }, [activeComponent]);

  const navItems = [
    { name: "Umaps", id: "umap", icon: <FaChartBar /> },
    { name: "Box Plots", id: "boxPlots", icon: <FaBox /> },
    { name: "DGE Analysis", id: "dgeAnalysis", icon: <FaDna /> },
    {
      name: "Enrichment Analysis",
      id: "enrichmentAnalysis",
      icon: <FaFlask />,
    },
  ];

  return (
    <StudyNodeProvider>
      <Box>
        <ExplorerNavbar
          navItems={navItems}
          activeComponent={activeComponent}
          setActiveComponent={setActiveComponent}
        />
        <Box>
          <Box display={activeComponent === "umap" ? "block" : "none"}>
            <UmapPage setActiveComponent={setActiveComponent} />
          </Box>
          <Box display={activeComponent === "boxPlots" ? "block" : "none"}>
            <BoxFilter />
          </Box>
          <Box display={activeComponent === "dgeAnalysis" ? "block" : "none"}>
            <DgeAnalysisPage setActiveComponent={setActiveComponent} />
          </Box>
          <Box
            display={
              activeComponent === "enrichmentAnalysis" ? "block" : "none"
            }
          >
            <EnrichmentAnalysisPage
              activeComponent={activeComponent}
              setActiveComponent={setActiveComponent}
            />
          </Box>
        </Box>
      </Box>
    </StudyNodeProvider>
  );
};

export default ExplorerPage;
