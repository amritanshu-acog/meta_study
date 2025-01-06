import React, { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button, IconButton } from "@chakra-ui/react"; // Using Chakra UI button for consistency
import { FaDownload } from "react-icons/fa";

const GeneBoxTable = ({ geneTableData }) => {
  const gridRef = useRef(); // Reference to the Ag-Grid component

  // Transform geneTableData for usage in AG Grid
  const rowData = geneTableData.gene.map((_, i) => ({
    gene: geneTableData.gene[i],
    xAxis_label: geneTableData.x_axis_val[i],
    cohort: geneTableData.split_by_val[i],
    mean: geneTableData.mean_expr[i],
    median: geneTableData.median_expr[i],
    non_zero_expr_fraction: geneTableData.non_zero_expr_fraction[i],
    non_zero_expr_percent: geneTableData.non_zero_expr_percent[i],
    non_zero_mean: geneTableData.non_zero_expr_mean[i],
    non_zero_median: geneTableData.non_zero_expr_median[i],
  }));

  // Column definitions for headers and field matching
  const columnDefs = [
    {
      headerName: "Gene",
      field: "gene",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "X Axis Label Value",
      field: "xAxis_label",
      sortable: true,
      filter: true,
      width: 180,
    },
    {
      headerName: "Cohort",
      field: "cohort",
      sortable: true,
      filter: true,
      width: 120,
    },
    {
      headerName: "Mean",
      field: "mean",
      sortable: true,
      filter: "agNumberColumnFilter",
      width: 140,
      valueFormatter: (params) => {
        if (params.value === 0) return params.value;
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "Median",
      field: "median",
      sortable: true,
      filter: "agNumberColumnFilter",
      width: 100,
      valueFormatter: (params) => {
        if (params.value === 0) return params.value;
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "Non Zero expr",
      field: "non_zero_expr_fraction",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      headerName: "Non Zero expr.%",
      field: "non_zero_expr_percent",
      sortable: true,
      filter: "agNumberColumnFilter",
      width: 150,
    },
    {
      headerName: "Non Zero Mean",
      field: "non_zero_mean",
      sortable: true,
      filter: "agNumberColumnFilter",
      width: 150,
      valueFormatter: (params) => {
        if (params.value === 0) return params.value;
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "Non Zero Median",
      field: "non_zero_median",
      sortable: true,
      filter: "agNumberColumnFilter",
      width: 150,
      valueFormatter: (params) => {
        if (params.value === 0) return params.value;
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
  ];

  const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  return (
    <div
      className="flex flex-col ag-theme-quartz mx-0 ml-0 border rounded-md p-4"
      style={{ width: "100%", padding: "20px", marginTop: "40px" }}
    >
      <Button
        colorScheme="blue"
        onClick={onExportClick}
        mb={4}
        width="fit-content"
        alignSelf="end"
        size="sm"
        py={5}
      >
        <FaDownload className="mr-2" />
        Download CSV
      </Button>
      {/* AG Grid Table */}
      <AgGridReact
        ref={gridRef}
        rowData={rowData} // Use transformed row data
        columnDefs={columnDefs} // Set column definitions
        domLayout="autoHeight" // Dynamic height
        defaultColDef={{
          resizable: true, // Allow resizing columns
          filter: true, // Enable filtering for all columns
          floatingFilter: true,
          sortable: true, // Enable sorting for all columns
        }}
        pagination={true} // Enable pagination
        paginationPageSize={10} // Page size
      />
    </div>
  );
};

export default GeneBoxTable;
