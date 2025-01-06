import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Box, Text, Button } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import Breadcrumb from "../../BreadCrumb";
import { getStudyData } from "../utils";
import {
  FaChevronDown,
  FaChevronUp,
  FaDisease,
  FaDna,
  FaFlask,
} from "react-icons/fa";
import { Database, FileText } from "lucide-react";

const StudyNodeSummary = () => {
  const { studyId, nodeId } = useParams();
  const [study, setStudy] = useState(null);
  const [activeNode, setActiveNode] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const studyDescriptionInitialLength = 80;

  useEffect(() => {
    getStudyData(studyId, nodeId, setStudy, setActiveNode);
  }, [studyId, nodeId]);

  const { basic_stats, sample_wise_stats } = activeNode || {};

  const sampleStatsAvailable = sample_wise_stats?.sample?.length > 0;

  const basicStatsColumnDefs = [
    { headerName: "Cohorts", field: "Cohorts" },
    { headerName: "Number of Genes", field: "Number_of_Genes" },
    { headerName: "Number of Cohorts", field: "Number_of_Cohorts" },
    { headerName: "Number of Samples", field: "Number_of_Samples" },
    { headerName: "Total Number of Cells", field: "Total_Number_of_Cells" },
  ];

  // const basicStatsRowData = basic_stats ? [basic_stats] : [];
  console.log(basic_stats);

  console.log(activeNode);
  const columnDefs = [
    { headerName: "Sample", field: "sample" },
    { headerName: "Cohort", field: "cohort" },
    { headerName: "Number of Cells", field: "number_of_cells" },
  ];

  const rowData = sampleStatsAvailable
    ? sample_wise_stats.sample.map((_, index) => ({
        sample: sample_wise_stats.sample[index],
        cohort: sample_wise_stats.cohort[index],
        number_of_cells: sample_wise_stats.number_of_cells[index],
      }))
    : [];

  const defaultColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    floatingFilter: true,
    flex: 1,
  };

  const breadcrumbItems = [
    { label: "All Studies", href: "/all-studies" },
    { label: study?.human_readable_study_id || "Loading..." },
    { label: activeNode?.node_label || "Loading..." },
    { label: "Summary" },
  ];

  // Truncate description to 100 words
  const truncateDescription = (description) => {
    if (!description) return "";
    const words = description.split(" ");
    return words.length > studyDescriptionInitialLength
      ? words.slice(0, studyDescriptionInitialLength).join(" ") + "..."
      : description;
  };

  return (
    <Box>
      <Box p={8} maxW="1200px" mx="auto">
        <Breadcrumb items={breadcrumbItems} />
        <Text as="h1" fontSize="33px" fontWeight="medium">
          {study?.title || "Loading..."}
        </Text>
        <Box className="border rounded-md mt-12 mb-4 p-4">
          <Box
            fontSize="24px"
            fontWeight="semibold"
            color="#004664"
            display="flex"
            alignItems="center"
            gap="1"
            mb="4"
          >
            <FileText className="h-5 w-5" /> Study Summary
          </Box>

          <Text mb={4} fontSize="16px">
            {showFullDescription
              ? study?.description || "No description available."
              : truncateDescription(study?.description)}
          </Text>

          {study?.description &&
            study?.description.split(" ").length >
              studyDescriptionInitialLength && (
              <Button
                color="#3182ce"
                variant="link"
                onClick={() => setShowFullDescription(!showFullDescription)}
              >
                {showFullDescription ? (
                  <>
                    Read Less <FaChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Read More <FaChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
        </Box>

        <Box className="border rounded-md mt-8 mb-4 p-4">
          <Box
            fontSize="24px"
            fontWeight="semibold"
            color="#004664"
            display="flex"
            alignItems="center"
            gap="1"
            mb="4"
          >
            <Database className="h-5 w-5" /> Data Overview
          </Box>
          {activeNode && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 border rounded-lg">
                <div className="flex items-center gap-1 text-lg font-semibold mb-2">
                  <FaDisease /> Number of Cells
                </div>
                <p className="text-3xl font-bold text-primary">
                  {basic_stats.number_of_cells}
                </p>
              </div>
              <div className="bg-primary/10 p-4 border rounded-lg">
                <div className="flex items-center gap-1 text-lg font-semibold mb-2">
                  <FaDna className="h-4 w-4" /> Number of Genes
                </div>
                <p className="text-3xl font-bold text-primary">
                  {basic_stats.number_of_genes}
                </p>
              </div>
              <div className="bg-primary/10 p-4 border rounded-lg">
                <h3 className="flex items-center gap-1 text-lg font-semibold mb-2">
                  <FaFlask /> Number of Samples
                </h3>
                <p className="text-3xl font-bold text-primary">
                  {basic_stats.number_of_samples}
                </p>
              </div>
            </div>
          )}
        </Box>

        <Box className="border rounded-md mt-8 mb-4 p-4">
          <Box
            fontSize="24px"
            fontWeight="semibold"
            color="#004664"
            display="flex"
            alignItems="center"
            gap="1"
            mb="4"
          >
            <Database className="h-5 w-5" /> Sample-Wise Data
          </Box>
          <Box
            className="ag-theme-quartz"
            style={{ height: "400px", width: "100%" }}
          >
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              getRowStyle={(params) => ({
                backgroundColor:
                  params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
              })}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StudyNodeSummary;
