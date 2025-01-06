import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Text } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { getStudyData } from "../utils";
import Breadcrumb from "../../BreadCrumb";
import { FaDisease, FaDna } from "react-icons/fa";

const Observations = () => {
  const { studyId, nodeId } = useParams();
  const [study, setStudy] = useState(null);
  const [activeNode, setActiveNode] = useState(null);

  const navigate = useNavigate();
  const [table1Data, setTable1Data] = useState([]);
  const [table2Data, setTable2Data] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getStudyData(studyId, nodeId, setStudy, setActiveNode);
  }, [studyId, nodeId]);

  const columnDefsForTable1 = [
    {
      headerName: "Cell Type",
      field: "cell_type",
      sortable: true,
      filter: true,
      onCellClicked: (params) => handleCellClick(params),
      cellStyle: { color: "#3182CE", cursor: "pointer" }, // blue.500
    },
    { headerName: "Level", field: "level", sortable: true, filter: true },
    {
      headerName: "Comparison",
      field: "comparison",
      sortable: true,
      filter: true,
    },
    {
      headerName: "Variation in Proportion",
      field: "variation_in_proportion",
      sortable: true,
      filter: true,
      sort: "asc",
    },
  ];

  const columnDefsForTable2 = [
    {
      headerName: "Cell Type",
      field: "cell_type",
      sortable: true,
      filter: true,
      onCellClicked: (params) => handleCellClick(params),
      cellStyle: { color: "#3182CE", cursor: "pointer" }, // blue.500
    },
    { headerName: "Level", field: "level", sortable: true, filter: true },
    {
      headerName: "Comparison",
      field: "comparison",
      sortable: true,
      filter: true,
    },

    {
      headerName: "Upregulated genes info",
      headerClass: "custom-header centered-header",
      children: [
        {
          headerName: "No. of Genes",
          field: "upregulated_number_of_genes",
          sortable: true,
          filter: true,
        },
        {
          headerName: "GO BP terms",
          field: "upregulated_gobp_terms",
          sortable: true,
          filter: true,
        },
        {
          headerName: "Reactome terms",
          field: "upregulated_reactome_terms",
          sortable: true,
          filter: true,
        },
      ],
    },
    {
      headerName: "Downregulated genes info",
      headerClass: "custom-header centered-header",

      children: [
        {
          headerName: "No. of Genes",
          field: "downregulated_number_of_genes",
          sortable: true,
          filter: true,
        },
        {
          headerName: "GO BP terms",
          field: "downregulated_gobp_terms",
          sortable: true,
          filter: true,
        },
        {
          headerName: "Reactome terms",
          field: "downregulated_reactome_terms",
          sortable: true,
          filter: true,
        },
      ],
    },
  ];

  useEffect(() => {
    const fetchObservations = async () => {
      try {
        setLoading(true);
        const pipeline_id = nodeId;
        const response = await axios.get("/api/standard-observations", {
          params: { pipeline_id },
        });

        // console.log("API Response: ", response.data);

        const parsedTable1Data = response.data.table1_res.map((item) => ({
          observation_id: item.observation_id, // Store observation_id
          cell_type: item.finding.cell_type,
          comparison: item.finding.comparison,
          level: item.finding.level,
          variation_in_proportion: item.finding.variation_in_proportion,
        }));

        const parsedTable2Data = response.data.table2_res.map((item) => ({
          observation_id: item.observation_id, // Store observation_id
          cell_type: item.finding.cell_type,
          comparison: item.finding.comparison,
          level: item.finding.level,
          upregulated_number_of_genes: item.finding.upregulated_number_of_genes,
          upregulated_gobp_terms: item.finding.upregulated_gobp_terms,
          upregulated_reactome_terms: item.finding.upregulated_reactome_terms,
          downregulated_number_of_genes:
            item.finding.downregulated_number_of_genes,
          downregulated_gobp_terms: item.finding.downregulated_gobp_terms,
          downregulated_reactome_terms:
            item.finding.downregulated_reactome_terms,
        }));

        setTable1Data(parsedTable1Data);
        setTable2Data(parsedTable2Data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching observations:", error);
        setError("Failed to load observations. Please try again later.");
        setLoading(false);
      }
    };

    if (nodeId) {
      fetchObservations();
    } else {
      setError("Pipeline ID is missing or undefined.");
      setLoading(false);
    }
  }, [nodeId]);

  const handleCellClick = (params) => {
    const { observation_id } = params.data;
    navigate(
      `/study/${studyId}/observations/${activeNode.node_id}/observation/${observation_id}`
    );
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const breadcrumbItems = [
    { label: "All Studies", href: "/all-studies" },
    { label: study?.human_readable_study_id || "Loading..." },
    { label: activeNode?.node_label || "Loading..." },
    { label: "Observations" },
  ];

  return (
    <Box>
      <Box p={8} maxW="1200px" mx="auto">
        <Breadcrumb items={breadcrumbItems} />
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
            <FaDisease className="h-5 w-5" /> Cell Proportion
          </Box>
          <div
            className="ag-theme-quartz"
            style={{ height: 600, width: "100%" }}
          >
            <AgGridReact
              columnDefs={columnDefsForTable1}
              rowData={table1Data}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                floatingFilter: true,
                flex: 1,
              }}
              getRowStyle={(params) => ({
                backgroundColor:
                  params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
              })}
            />
          </div>
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
            <FaDna className="h-5 w-5" /> Differential Gene Expression
          </Box>
          <div
            className="ag-theme-quartz"
            style={{ height: 600, width: "100%" }}
          >
            <AgGridReact
              columnDefs={columnDefsForTable2}
              rowData={table2Data}
              defaultColDef={{
                resizable: true,
                sortable: true,
                filter: true,
                floatingFilter: true,
                flex: 1,
              }}
              getRowStyle={(params) => ({
                backgroundColor:
                  params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
              })}
            />
          </div>
        </Box>
      </Box>
    </Box>
  );
};

export default Observations;
