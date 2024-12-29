import React from "react";
import { AgGridReact } from "ag-grid-react";
import { Box } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

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
          {gene.trim()}
        </div>
      ))}
    </Box>
  );
};

const EnrichmentTable = ({ tableData }) => {
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return value;
    }
    const numberValue = Number(value);
    if (Math.abs(numberValue) >= 1e4 || Math.abs(numberValue) < 1e-4) {
      // Use exponential notation for large/small values
      return numberValue.toExponential(4);
    }
    // Otherwise, format to four decimal places
    return numberValue.toFixed(4);
  };

  const columnDefs = [
    { headerName: "Term", field: "term", filter: "agTextColumnFilter" },
    { headerName: "Overlap", field: "overlap", filter: "agTextColumnFilter" },
    {
      headerName: "Overlap Percent",
      field: "overlapPercent",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "P-value",
      field: "pValue",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "-log10P-value",
      field: "logPValue",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Adjusted P-value",
      field: "adjustedPValue",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "-log10Adjusted P-value",
      field: "logAdjPValue",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Odds Ratio",
      field: "oddsRatio",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Combined Score",
      field: "combinedScore",
      valueFormatter: (params) => formatValue(params.value),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Genes",
      field: "genes",
      cellRenderer: GenesCellRenderer, // Use custom cell renderer
      width: 700, // Specify a width for the column if needed
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

  return (
    <Box className="ag-theme-alpine" height="500px" width="100%">
      <AgGridReact columnDefs={columnDefs} rowData={rowData} />
    </Box>
  );
};

export default React.memo(EnrichmentTable);
