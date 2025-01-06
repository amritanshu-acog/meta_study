import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Button, Box, Text, HStack } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { FaDna, FaDownload, FaUpload } from "react-icons/fa";
import Loader from "../../Loader";
import { useParams } from "react-router-dom";

// Utility function for consistent numeric formatting
const formatValue = (value) => {
  if (value === 0) return value;
  return value < 1 && value > -1
    ? parseFloat(value).toExponential(2)
    : parseFloat(value).toFixed(2);
};

const columnDefs = [
  {
    headerName: "Gene",
    field: "gene",
    sortable: true,
    filter: true,
    cellRenderer: (props) => (
      <a
        href={`https://maayanlab.cloud/Harmonizome/gene/${props.value}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: "#3182ce",
          textDecoration: "underline",
          cursor: "pointer",
        }}
      >
        {props.value}
      </a>
    ),
    minWidth: 100,
  },
  {
    headerName: "P-value",
    field: "pvalue",
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: (params) => formatValue(params.value),
  },
  {
    headerName: "LogFC",
    field: "logfc",
    sortable: true,
    filter: "agNumberColumnFilter",
    valueFormatter: (params) => formatValue(params.value),
  },
  {
    headerName: "Mean in Selection 1",
    field: "mean_in_selection_1",
    valueFormatter: (params) => formatValue(params.value),
    headerClass: "wrap-header",
  },
  {
    headerName: "Mean in Selection 2",
    field: "mean_in_selection_2",
    valueFormatter: (params) => formatValue(params.value),
  },
  {
    headerName: "Non-zero expr. in Selection 1",
    field: "non_zero_expr_in_selection_1",
  },
  {
    headerName: "Non-zero expr. in Selection 2",
    field: "non_zero_expr_in_selection_2",
  },
  {
    headerName: "Non-zero expr. % in Selection 1",
    field: "non_zero_expr_percent_in_selection_1",
  },
  {
    headerName: "Non-zero expr. % in Selection 2",
    field: "non_zero_expr_percent_in_selection_2",
  },
].map((col) => ({ ...col, sortable: true, filter: true, width: 150 }));

const SelectionTable = ({ rowData }) => (
  <div className="ag-theme-quartz" style={{ height: "auto", width: "100%" }}>
    <AgGridReact
      rowData={rowData}
      columnDefs={[
        {
          headerName: "Cell Type",
          field: "cellType",
          sortable: true,
          filter: true,
        },
        {
          headerName: "Selection Count",
          field: "selectionCount",
          sortable: true,
          filter: true,
        },
      ]}
      defaultColDef={{
        resizable: true,
        sortable: true,
        filter: true,
        floatingFilter: true,
        flex: 1,
      }}
      domLayout="autoHeight"
      pagination
      paginationPageSize={5}
    />
  </div>
);

const DgeOnline = ({
  dgeSelectionData,
  color,
  setActiveComponent,
  includeTable,
}) => {
  const { nodeId } = useParams();
  const [isDgeVisible, setIsDgeVisible] = useState(false);
  const [dgeSelection, setDgeSelection] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [selectionRowData, setSelectionRowData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const gridRef = useRef();

  useEffect(() => {
    const interval = setInterval(
      () => setDgeSelection(dgeSelectionData.current),
      500
    );
    return () => clearInterval(interval);
  }, [dgeSelectionData]);

  useEffect(() => {
    if (dgeSelection.length === 2) fetchDgeData();
  }, [dgeSelection, color]);

  const fetchDgeData = async () => {
    setLoading(true);
    setError("");
    const apiUrl = `/api/${nodeId}/umaps/online-dge`;
    try {
      const response = await axios.post(apiUrl, {
        cell_ids_set1: dgeSelection[0]?.selection || [],
        cell_ids_set2: dgeSelection[1]?.selection || [],
        category_key: color,
      });
      const data = response.data;
      setApiResponse(data);
      setSelectionRowData({
        selection1: createSelectionRowData(
          data.distribution_of_cell_types_in_selection1
        ),
        selection2: createSelectionRowData(
          data.distribution_of_cell_types_in_selection2
        ),
      });
      setTableData(transformResponseToRowData(data.online_dge_df));
    } catch (err) {
      setError("Failed to fetch data. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createSelectionRowData = (distribution) =>
    Object.entries(distribution || {}).map(([cellType, selectionCount]) => ({
      cellType,
      selectionCount,
    }));

  const transformResponseToRowData = (onlineDgeDf = {}) => {
    const columns = Object.keys(onlineDgeDf);
    return (onlineDgeDf[columns[0]] || []).map((_, i) =>
      columns.reduce((row, col) => ({ ...row, [col]: onlineDgeDf[col][i] }), {})
    );
  };

  const pushDataToEnrichment = () => {
    const result = {
      source: "umaps",
      metaData: {
        selection1: {
          label: dgeSelection[0].label,
          cellCount: apiResponse[`num_cells_in_selection1`],
          selectionRowData: selectionRowData.selection1,
        },
        selection2: {
          label: dgeSelection[1].label,
          cellCount: apiResponse[`num_cells_in_selection2`],
          selectionRowData: selectionRowData.selection2,
        },
      },
      upregulated: tableData.filter((row) => row.logfc > 0),
      downregulated: tableData.filter((row) => row.logfc < 0),
    };
    sessionStorage.setItem("enrichmentInput", JSON.stringify(result));
    setActiveComponent("enrichmentAnalysis");
  };

  return (
    <div>
      {includeTable && (
        <Button
          onClick={() => setIsDgeVisible((prev) => !prev)}
          colorScheme="blue"
          size="md"
        >
          <FaDna className="mr-2" />
          {isDgeVisible
            ? "Hide differentially expressed genes"
            : "See differentially expressed genes"}
        </Button>
      )}

      {isDgeVisible && (
        <Box className="mt-8">
          {loading ? (
            <Loader />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : dgeSelection.length === 2 && tableData.length > 0 ? (
            <>
              <Box className="border p-2 rounded-md">
                <Text fontWeight="bold" fontSize="30px" mb={4}>
                  Selections
                </Text>
                <HStack spacing={4} flexWrap="wrap" alignItems="start">
                  {["selection1", "selection2"].map((key, index) => (
                    <Box key={key} flex="1">
                      <Text fontSize="20px" mb={2}>
                        {index + 1}.{" "}
                        <span style={{ color: "#3182ce", fontWeight: "bold" }}>
                          {dgeSelection[index]?.label?.toUpperCase()}
                        </span>{" "}
                        -{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {apiResponse[`num_cells_in_${key}`]}
                        </span>{" "}
                        selections
                      </Text>
                      <SelectionTable rowData={selectionRowData[key]} />
                    </Box>
                  ))}
                </HStack>
              </Box>
              <Box mt={6} className="border p-2 rounded-md">
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  mb={4}
                >
                  <Text fontWeight="bold" fontSize="30px" mb={4}>
                    Differentially Expressed Genes
                  </Text>
                  <Box>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={pushDataToEnrichment}
                      mr={2}
                    >
                      <FaUpload className="mr-2" />
                      Push to Enrichment
                    </Button>
                    <Button
                      colorScheme="blue"
                      size="sm"
                      onClick={() => gridRef.current.api.exportDataAsCsv()}
                    >
                      <FaDownload className="mr-2" />
                      Download CSV
                    </Button>
                  </Box>
                </HStack>
                <div
                  className="ag-theme-quartz"
                  style={{ height: "auto", width: "100%" }}
                >
                  <AgGridReact
                    ref={gridRef}
                    rowData={tableData}
                    columnDefs={columnDefs}
                    domLayout="autoHeight"
                    pagination
                    paginationPageSize={10}
                    defaultColDef={{
                      resizable: true,
                      sortable: true,
                      filter: true,
                      floatingFilter: true,
                      // minWidth: 100,
                      minWidth: 150,
                      flex: 1,
                    }}
                  />
                </div>
              </Box>
            </>
          ) : (
            <Text>
              Please make {2 - dgeSelection.length} selections to perform the
              DGE analysis.
            </Text>
          )}
        </Box>
      )}
    </div>
  );
};

export { DgeOnline as default, SelectionTable };
