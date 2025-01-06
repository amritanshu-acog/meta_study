import { VStack, HStack, Box, Text } from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { SelectionTable } from "../umaps/DgeOnline";

const GeneCellRenderer = (props) => (
  <HStack>
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
  </HStack>
);

const UmapMetaData = ({ data }) => {
  return (
    <Box className="border p-2 rounded-md mt-8">
      <Text fontWeight="bold" fontSize="30px" mb={4}>
        Selections
      </Text>
      <HStack
        spacing={8}
        justifyContent="center"
        alignItems="start"
        flexWrap="wrap"
      >
        {["selection1", "selection2"].map((key, index) => (
          <Box key={key} flex="1">
            <Text fontSize="20px" mb={2}>
              {index + 1}.{" "}
              <span style={{ color: "#3182ce", fontWeight: "bold" }}>
                {data.metaData[key].label?.toUpperCase()}
              </span>{" "}
              -{" "}
              <span style={{ fontWeight: "bold" }}>
                {data.metaData[key].cellCount}
              </span>{" "}
              selections
            </Text>
            <SelectionTable rowData={data.metaData[key].selectionRowData} />
          </Box>
        ))}
      </HStack>
    </Box>
  );
};

const filterStyle = {
  borderRight: "1px solid rgba(0, 0, 0, 0.05)",
  padding: "0 35px",
};

const DgeMetaData = ({ data }) => {
  return (
    <Box className="border p-2 rounded-md mt-8">
      <Box
        mb={1}
        fontSize="22px"
        fontWeight="semibold"
        color="rgba(0, 0, 0, 0.85)"
      >
        Filters Used
      </Box>
      <HStack
        mb={4}
        wrap="wrap"
        spacing={4}
        bg="#f5f5f5"
        p="16px"
        borderRadius="xl"
        // w="fit-content"
        // mx="auto"
        mt="20px"
        shadow="sm"
      >
        <Box style={filterStyle}>
          <p>
            -log₁₀ p-value Threshold :{" "}
            <b>{data.metaData.significanceThreshold}</b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            log₂ FC Threshold :{" "}
            <b>
              {
                data.metaData.foldChangeThreshold === 0
                  ? "0" // Show 0 if the value is exactly zero
                  : Math.abs(data.metaData.foldChangeThreshold) < 1
                  ? data.metaData.foldChangeThreshold.toExponential(2) // Use exponential notation for small values
                  : data.metaData.foldChangeThreshold.toFixed(1) // Use fixed notation for larger values
              }
            </b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            Split By Key: <b>{data.metaData.usedFilters.splitByKey}</b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            Comparison: <b>{data.metaData.usedFilters.comparison}</b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            Cell Type Level: <b>{data.metaData.usedFilters.cellTypeLevel}</b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            Cell Type: <b>{data.metaData.usedFilters.cellType}</b>
          </p>
        </Box>
        <Box style={filterStyle}>
          <p>
            Shrinkage:{" "}
            <b>
              {data.metaData.usedFilters.shrinkage === "true" ? "Yes" : "No"}
            </b>
          </p>
        </Box>
      </HStack>
    </Box>
  );
};

// Common column definitions
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
    headerName: "log₂ FC",
    field: "log2FoldChange",
    sortable: true,
    filter: "agTextColumnFilter",
    headerClass: "header-red",
    width: 150,
    valueFormatter: ({ value }) => {
      if (typeof value === "number") {
        return value < 1 && value > -1
          ? value.toExponential(2)
          : value.toFixed(2);
      }
      return value;
    },
  },
  {
    headerName: "p-value",
    field: "pvalue",
    sortable: true,
    filter: "agNumberColumnFilter",
    headerClass: "header-red",
    width: 150,
    valueFormatter: ({ value }) => {
      if (typeof value === "number") {
        return value < 1 && value > -1
          ? value.toExponential(2)
          : value.toFixed(2);
      }
      return value;
    },
  },
  {
    headerName: "-log₁₀ p-value",
    field: "negativeLog10PValue",
    sortable: true,
    filter: "agNumberColumnFilter",
    headerClass: "header-red",
    width: 150,
    valueFormatter: ({ value }) =>
      typeof value === "number" ? value.toFixed(2) : value,
  },
  {
    headerName: "P Adjusted",
    field: "padj",
    sortable: true,
    filter: "agNumberColumnFilter",
    headerClass: "header-red",
    width: 150,
    valueFormatter: ({ value }) => {
      if (typeof value === "number") {
        return value < 1 && value > -1
          ? value.toExponential(2)
          : value.toFixed(2);
      }
      return value;
    },
  },
];

// Table component for reusability
const GeneTable = ({ title, rowData }) => {
  return (
    <VStack width="50%" alignItems="start">
      <Box
        mb={1}
        fontSize="22px"
        fontWeight="semibold"
        color="rgba(0, 0, 0, 0.85)"
      >
        {title}
      </Box>
      <div style={{ height: "400px", width: "100%", overflow: "auto" }}>
        <AgGridReact
          className="ag-theme-quartz w-[800px] mx-0 ml-0"
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
            floatingFilter: true,
            flex: 1,
          }}
          pagination={false}
          getRowStyle={({ node }) => ({
            backgroundColor: node.rowIndex % 2 === 0 ? "#ffffff" : "#f5f5f5",
          })}
        />
      </div>
    </VStack>
  );
};

const EnrichmentInputTable = ({ data }) => {
  return (
    <div>
      {data.source === "umaps" && <UmapMetaData data={data} />}
      {data.source === "dge" && <DgeMetaData data={data} />}
      <Box className="border p-2 rounded-md mt-12">
        <HStack
          spacing={8}
          justifyContent="center"
          alignItems="start"
          padding="0 20px"
          paddingBottom="50px"
        >
          <GeneTable
            title="Down Regulated Genes"
            rowData={data.downregulated}
          />
          <GeneTable title="Up Regulated Genes" rowData={data.upregulated} />
        </HStack>
      </Box>
    </div>
  );
};

export default EnrichmentInputTable;
