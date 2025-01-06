import React, { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import { Box, Button, IconButton } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { FaDownload } from "react-icons/fa";

// Custom cell renderer function for genes column
const GenesCellRenderer = (params) => {
  // Split genes by semicolon
  const genes = params.value ? params.value.split(";") : [];

  return (
    <Box
      maxHeight="100px" // Fixed height for the scrollable area
      overflowY="scroll" // Allows vertical scrolling
      display="flex"
      flexWrap="wrap"
      alignItems="flex-start"
    >
      {genes.map((gene, index) => (
        <div
          key={index}
          style={{
            fontSize: "0.8em",
            borderRadius: "15px",
            padding: "0 8px",
            margin: "1px",
          }}
        >
          {/* {gene.trim()} */}
          <a
            href={`https://maayanlab.cloud/Harmonizome/gene/${gene.trim()}`}
            target="_blank" // Ensures link opens in new tab
            rel="noopener noreferrer" // Security best practices when opening new tabs
            style={{
              color: "#3182ce", // Standard link color
              textDecoration: "underline", // Underline to make it look more like a link
              cursor: "pointer", // Pointer cursor to indicate it's clickable
            }}
          >
            {gene.trim()}
          </a>
        </div>
      ))}
    </Box>
  );
};

const EnrichmentTable = ({ tableData }) => {
  const gridRef = useRef();

  const columnDefs = [
    {
      headerName: "Term",
      field: "term",
      filter: "agTextColumnFilter",
      width: 250,
    },
    {
      headerName: "Overlap",
      field: "overlap",
      filter: "agTextColumnFilter",
      width: 150,
    },
    {
      headerName: "Overlap Percent",
      field: "overlapPercent",
      filter: "agTextColumnFilter",
      width: 180,
    },
    {
      headerName: "P-value",
      field: "pValue",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
      width: 150,
    },
    {
      headerName: "-log10P-value",
      field: "logPValue",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
      width: 150,
    },
    {
      headerName: "Adjusted P-value",
      field: "adjustedPValue",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
      width: 180,
    },
    {
      headerName: "-log10Adjusted P-value",
      field: "logAdjPValue",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
      width: 200,
    },
    {
      headerName: "Odds Ratio",
      field: "oddsRatio",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
      width: 150,
    },
    {
      headerName: "Combined Score",
      field: "combinedScore",
      filter: "agTextColumnFilter",
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
      width: 180,
    },
    {
      headerName: "Genes",
      field: "genes",
      cellRenderer: GenesCellRenderer, // Use custom cell renderer
      width: 500,
      height: 10,
      wrapText: true,
      autoHeight: true,
      filter: "agTextColumnFilter",
    },
  ];

  const rowData = tableData.Term.map((term, index) => ({
    term,
    overlap: tableData.Overlap[index],
    overlapPercent: tableData["Overlap Percent"][index],
    pValue: tableData["P-value"][index],
    logPValue: tableData["-log10P-value"][index],
    adjustedPValue: tableData["Adjusted P-value"][index],
    logAdjPValue: tableData["-log10Adjusted P-value"][index],
    oddsRatio: tableData["Odds Ratio"][index],
    combinedScore: tableData["Combined Score"][index],
    genes: tableData["Genes"][index], // keep it as a single string
  }));

  const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  return (
    <div className="flex flex-col border rounded-md p-4">
      <Button
        colorScheme="blue"
        onClick={onExportClick}
        mb={4}
        size="sm"
        py={5}
        width="fit-content"
        alignSelf="end"
      >
        <FaDownload className="mr-2" />
        Download CSV
      </Button>
      <Box
        className="ag-theme-quartz"
        style={{
          // height: "400px",
          width: "100%",
        }}
      >
        <AgGridReact
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true,
          }}
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          getRowStyle={(params) => ({
            backgroundColor:
              params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
          })}
        />
      </Box>
    </div>
  );
};

export default React.memo(EnrichmentTable);
