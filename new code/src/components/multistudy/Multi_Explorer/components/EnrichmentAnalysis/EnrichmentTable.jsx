import React from "react";
import { AgGridReact } from "ag-grid-react";
import { Box } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const EnrichmentTable = ({ studiesData, sizeByLabel, colorByLabel }) => {
  // Custom formatter for values
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

  // Generate column definitions dynamically
  const columnDefs = [
    { headerName: "Term", field: "term", filter: "agTextColumnFilter" },
    ...[...new Set(studiesData.map((data) => data.studyname))].map((studyName) => ({
      headerName: studyName,
      children: [
        {
          headerName: colorByLabel,
          field: `${studyName}_colorby`,
          filter: "agNumberColumnFilter",
          valueFormatter: (params) => formatValue(params.value), // Use custom formatValue
        },
        {
          headerName: sizeByLabel,
          field: `${studyName}_sizeby`,
          filter: "agNumberColumnFilter",
          valueFormatter: (params) => formatValue(params.value), // Use custom formatValue
        },
      ],
    })),
  ];

  // Transform the data to match dynamic columns
  const transformedRowData = studiesData.reduce((acc, curr) => {
    const existing = acc.find((row) => row.term === curr.term);
    if (existing) {
      // Append sizeby and colorby values for the study
      existing[`${curr.studyname}_sizeby`] = curr.sizeby;
      existing[`${curr.studyname}_colorby`] = curr.colorby;
    } else {
      // Add new term with initial sizeby and colorby values
      acc.push({
        term: curr.term,
        [`${curr.studyname}_sizeby`]: curr.sizeby,
        [`${curr.studyname}_colorby`]: curr.colorby,
      });
    }
    return acc;
  }, []);

  return (
    <Box className="ag-theme-alpine" height="500px" width="100%">
      <AgGridReact
        columnDefs={columnDefs}
        rowData={transformedRowData}
        defaultColDef={{
          sortable: true,
          resizable: true,
          filter: true,
        }}
      />
    </Box>
  );
};

export default React.memo(EnrichmentTable);
