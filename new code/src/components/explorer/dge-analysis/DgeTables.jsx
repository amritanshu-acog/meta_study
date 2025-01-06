import { useState } from "react";

import {
  IconButton,
  HStack,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  SliderMark,
  VStack,
  Button,
  Flex,
} from "@chakra-ui/react";
import { FaUndoAlt, FaHighlighter, FaDownload } from "react-icons/fa";

import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DgeTables = ({
  data,
  initialFoldChangeThreshold,
  initialSignificanceThreshold,
}) => {
  console.log("DgeTables received data:", data);

  if (!data || !data.gene) return null;

  const geneList = data.gene || [];
  const searchGeneOptions = geneList.map((gene) => {
    return { value: gene, label: gene };
  });
  const [selectedGenes, setSelectedGenes] = useState([]);
  const [selectedGeneOptions, setSelectedGeneOptions] = useState([]);
  const [significanceThreshold, setSignificanceThreshold] = useState(
    initialSignificanceThreshold
  );
  const [visibility, setVisibility] = useState({
    upRegulated: true,
    downRegulated: true,
    nonSignificant: true,
    highlighted: true, // Added to keep track of highlighted gene visibility
  });

  // Determine min and max for sliders based on data
  const minPValue = Math.min(...data.pvalue.map((p) => -Math.log10(p)));
  const maxPValue = Math.max(
    ...data.pvalue.map((p) => Math.ceil(-Math.log10(p)))
  );
  const minLog2FoldChange = 0; // Set minimum to 0 for logical reasons
  const maxLog2FoldChange = Math.max(...data.log2FoldChange);
  const [foldChangeThreshold, setFoldChangeThreshold] = useState(
    initialFoldChangeThreshold !== undefined
      ? initialFoldChangeThreshold
      : (minLog2FoldChange + maxLog2FoldChange) / 2
  );

  // Transform data for tables
  const transformedData = data.gene.map((gene, index) => ({
    gene: gene,
    baseMean: data.baseMean[index],
    log2FoldChange: data.log2FoldChange[index],
    pvalue: data.pvalue[index],
    padj: data.padj[index],
    negativeLog10PValue: -Math.log10(data.pvalue[index]),
  }));

  // Separate upregulated and downregulated genes for tables (not affected by visibility state)
  const upregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange >= foldChangeThreshold &&
      -Math.log10(d.pvalue) >= significanceThreshold
  );
  const downregulatedGenes = transformedData.filter(
    (d) =>
      d.log2FoldChange <= -foldChangeThreshold &&
      -Math.log10(d.pvalue) >= significanceThreshold
  );

  // Custom renderer for clickable Genes (index)
  const GeneCellRenderer = (props) => {
    return (
      <HStack>
        {/* <IconButton
          icon={<FaHighlighter />}
          aria-label={`Highlight ${props.value}`}
          size="xs"
          title={`Highlight ${props.value}`}
          onClick={() => handleHighlightGene(props.value)}
        /> */}
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

  const columnDefs = [
    {
      headerName: "Gene",
      field: "gene",
      sortable: true,
      filter: "agTextColumnFilter",
      cellRenderer: GeneCellRenderer,
      headerClass: "header-red",
      width: 200,
    },
    {
      headerName: "Base Mean",
      field: "baseMean",
      sortable: true,
      filter: "agTextColumnFilter",
      headerClass: "header-gray",
      width: 150,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      headerName: "log₂ FC",
      field: "log2FoldChange",
      sortable: true,
      filter: "agTextColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "p-value",
      field: "pvalue",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
    {
      headerName: "-log₁₀ p-value",
      field: "negativeLog10PValue",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => parseFloat(params.value).toFixed(2),
    },
    {
      headerName: "P Adjusted",
      field: "padj",
      sortable: true,
      filter: "agNumberColumnFilter",
      headerClass: "header-red",
      width: 150,
      valueFormatter: (params) => {
        return params.value < 1 && params.value > -1
          ? parseFloat(params.value).toExponential(2)
          : parseFloat(params.value).toFixed(2);
      },
    },
  ];

  return (
    <HStack
      spacing={8}
      mt={12}
      justifyContent="center"
      alignItems="start"
      padding="20px 30px"
      className="border rounded-md"
    >
      {/* Downregulated Genes Table */}
      <VStack width="50%" alignItems="start">
        <Box
          mb={1}
          fontSize="22px"
          fontWeight="semibold"
          color="rgba(0, 0, 0, 0.85)"
        >
          Downregulated Genes
        </Box>

        <div style={{ height: "400px", width: "100%", overflow: "auto" }}>
          <AgGridReact
            className="ag-theme-quartz w-[800px] mx-0 ml-0"
            rowData={downregulatedGenes}
            columnDefs={columnDefs}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              floatingFilter: true,
            }}
            pagination={false} // Disable pagination if you want scrollable rows
            getRowStyle={(params) => ({
              backgroundColor:
                params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
            })}
          />
        </div>
      </VStack>
      {/* Upregulated Genes Table */}
      <VStack width="50%" alignItems="start">
        <Box
          mb={1}
          textAlign="left"
          fontSize="22px"
          fontWeight="semibold"
          color="rgba(0, 0, 0, 0.85)"
        >
          Upregulated Genes
        </Box>

        <div style={{ height: "400px", width: "100%", overflow: "auto" }}>
          <AgGridReact
            className="ag-theme-quartz w-[800px] mx-0 ml-0"
            rowData={upregulatedGenes}
            columnDefs={columnDefs}
            defaultColDef={{
              resizable: true,
              sortable: true,
              filter: true,
              floatingFilter: true,
            }}
            pagination={false} // Disable pagination if you want scrollable rows
            getRowStyle={(params) => ({
              backgroundColor:
                params.node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
            })}
          />
        </div>
      </VStack>
    </HStack>
  );
};

export default DgeTables;
