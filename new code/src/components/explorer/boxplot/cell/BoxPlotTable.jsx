import React, { useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import { Button, IconButton } from "@chakra-ui/react"; // Using Chakra UI button for consistency
import { FaDownload } from "react-icons/fa";

const BoxPlotTable = ({ plotData, mode }) => {
  const tableData =
    mode == "split"
      ? plotData.split_mode_res.table_data
      : plotData.merge_mode_res.table_data;

  const gridRef = useRef(); // Reference to the Ag-Grid component

  const rowData = tableData.x_axis_val.map((val, i) => ({
    singleR_label: tableData.x_axis_val[i],
    cohort: tableData.split_by_val[i],
    cell_count: tableData.cell_count[i],
    cell_proportion: tableData.x_axis_val_proportion[i],
  }));

  const columnDefs = [
    {
      headerName: "X axis label Value",
      field: "singleR_label",
      sortable: true,
      filter: "agTextColumnFilter",
      headerClass: "header-red",
      width: 200,
    },
    {
      headerName: "Cohort",
      field: "cohort",
      sortable: true,
      filter: "agTextColumnFilter",
      headerClass: "header-red",
      width: 150,
    },
    {
      headerName: "Cell Count",
      field: "cell_count",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
    },
    {
      headerName: "Cell Proportion",
      field: "cell_proportion",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        if (params.value === 0) return params.value;
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
  ];

  // Function to export grid data as CSV
  const onExportClick = () => {
    gridRef.current.api.exportDataAsCsv();
  };

  return (
    <div className="flex flex-col border rounded-md p-4">
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

      <div className="ag-theme-quartz mx-0 ml-0">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true,
            flex: 1,
          }}
          pagination={true}
          paginationPageSize={10}
          domLayout="autoHeight"
          getRowStyle={(params) => ({
            backgroundColor:
              params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
          })}
        />
      </div>
    </div>
  );
};

export default BoxPlotTable;
