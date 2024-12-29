import React from 'react';
import { AgGridReact } from 'ag-grid-react';
import { HStack, IconButton } from '@chakra-ui/react'; // Chakra UI components
import { FaHighlighter } from 'react-icons/fa'; // Icon for highlighting
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

// GeneCellRenderer component
const GeneCellRenderer = (props) => {
  const handleHighlightGene = (gene) => {
    console.log(`Highlighting gene: ${gene}`);
    // You can add the functionality to highlight the gene here, for example, by adding a CSS class
  };

  return (
    <HStack>
      <IconButton
        icon={<FaHighlighter />}
        aria-label={`Highlight ${props.value}`}
        size="xs"
        title={`Highlight ${props.value}`}
        onClick={() => handleHighlightGene(props.value)}
      />
      <a
        href={`https://maayanlab.cloud/Harmonizome/gene/${props.value}`}
        target="_blank" // Ensures link opens in new tab
        rel="noopener noreferrer" // Security best practices when opening new tabs
        style={{
          color: "blue", // Standard link color
          textDecoration: "underline", // Underline to make it look more like a link
          cursor: "pointer", // Pointer cursor to indicate it's clickable
        }}
      >
        {props.value}
      </a>
    </HStack>
  );
};

// Value formatter function
const valueFormatter = (params) => {
  if (params.value == null) return "";
  return Math.abs(params.value) < 0.001
    ? params.value.toExponential(4)
    : Number(params.value).toFixed(4);
};

// TableComponent
const TableComponent = ({ data }) => {
  const columnDefs = React.useMemo(() => {
    if (data.length === 0) return [];

    // Define columns dynamically based on data keys
    const studyColumns = Object.keys(data[0])
      .filter((key) => key !== 'gene')
      .reduce((acc, key) => {
        // Extract study name and property (log2FoldChange or pvalue)
        const [study, property] = key.split('_');

        if (!acc[study]) {
          acc[study] = [];
        }

        // Prioritize P-Value first and then Log2 Fold Change
        if (property === 'pvalue') {
          acc[study].unshift({
            headerName: 'P-Value',
            field: key,
            sortable: true,
            filter: true,
            resizable: true,
            valueFormatter: valueFormatter,
          });
        } else if (property === 'log2FoldChange') {
          acc[study].push({
            headerName: 'Log2 Fold Change',
            field: key,
            sortable: true,
            filter: true,
            resizable: true,
            valueFormatter: valueFormatter,
          });
        }

        return acc;
      }, {});

    // Create grouped columnDefs where each study has 'pvalue' and 'log2FoldChange' grouped together
    const columns = [
      {
        headerName: 'Gene',
        field: 'gene',
        sortable: true,
        filter: true,
        resizable: true,
        cellRenderer: GeneCellRenderer,
      },
      ...Object.keys(studyColumns).map((study) => ({
        headerName: study,
        children: studyColumns[study], // Group pvalue and log2FoldChange for each study
      })),
    ];

    return columns;
  }, [data]);

  const gridOptions = {
    domLayout: 'autoHeight', // Automatically adjust grid height based on content
    enableSorting: true,
    enableFilter: true,
  };

  return (
    <div
      className="ag-theme-alpine"
      style={{ height: '500px', width: '100%', overflowY: 'auto' }} // Set fixed height and allow vertical scrolling
    >
      <AgGridReact
        rowData={data}
        columnDefs={columnDefs}
        gridOptions={gridOptions}
        defaultColDef={{
          editable: false,
          filter: true,
          sortable: true,
        }}
        frameworkComponents={{
          geneCellRenderer: GeneCellRenderer, // Register GeneCellRenderer as a framework component
        }}
      />
    </div>
  );
};

export default TableComponent;
