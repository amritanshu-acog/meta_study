import React from 'react';
import { VStack, Box } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";

const EnrichmentInputTable = ({ data }) => {
  // Custom formatter for values
  console.log("enchi",data)
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

  const GeneCellRenderer = (props) => (
    <a
      href={`https://maayanlab.cloud/Harmonizome/gene/${props.value}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 underline cursor-pointer"
    >
      {props.value}
    </a>
  );

  const transformDataForColumns = (data, status) => {
    const studyColumns = Object.keys(data).map((studyName) => ({
      headerName: `Study: ${studyName}`,
      children: [
        {
          headerName: "Gene",
          field: `${studyName}_gene`,
          cellRenderer: GeneCellRenderer,
          minWidth: 120,
          width: 120,
        },
        {
          headerName: "P-value",
          field: `${studyName}_pvalue`,
          minWidth: 120,
          width: 120,
          valueFormatter: (params) => formatValue(params.value), // Format p-value
        },
        {
          headerName: "log₂ Fold Change",
          field: `${studyName}_log2FoldChange`,
          minWidth: 120,
          width: 120,
          valueFormatter: (params) => formatValue(params.value), // Format log2 Fold Change
        },
      ],
      minWidth: 390,
    }));

    const maxGeneCount = Math.max(
      ...Object.values(data).map(
        (study) => study[`${status}Genes`].length
      )
    );

    const rows = Array.from({ length: maxGeneCount }).map((_, index) => {
      const row = {};
      Object.entries(data).forEach(([studyName, studyData]) => {
        const geneData = studyData[`${status}Genes`][index] || {};
        row[`${studyName}_gene`] = geneData.gene || null;
        row[`${studyName}_pvalue`] = geneData.pvalue || null;
        row[`${studyName}_log2FoldChange`] = geneData.log2FoldChange || null;
      });
      return row;
    });

    return { columns: studyColumns, rows };
  };

  const upregulatedData = transformDataForColumns(data, "upregulated");
  const downregulatedData = transformDataForColumns(data, "downregulated");

  return (
    <VStack spacing={8} mt={6} align="start" className="w-full">
      {/* Upregulated Genes Table */}
      <Box className="w-full">
        <Box className="mb-4 text-xl font-bold" style={{ color: "rgba(0, 0, 255, 0.85)" }}>
          Upregulated Genes
        </Box>
        <div className="w-full h-[400px] ag-theme-alpine">
          <AgGridReact
            rowData={upregulatedData.rows}
            columnDefs={upregulatedData.columns}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
            pagination={false}
          />
        </div>
      </Box>

      {/* Downregulated Genes Table */}
      <Box className="w-full">
        <Box className="mb-4 text-xl font-bold" style={{ color: "rgba(255, 0, 0, 0.85)" }}>
          Downregulated Genes
        </Box>
        <div className="w-full h-[400px] ag-theme-alpine">
          <AgGridReact
            rowData={downregulatedData.rows}
            columnDefs={downregulatedData.columns}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
            }}
            pagination={false}
          />
        </div>
      </Box>
    </VStack>
  );
};

export default EnrichmentInputTable;
