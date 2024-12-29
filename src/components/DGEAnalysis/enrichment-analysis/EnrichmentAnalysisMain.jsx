import React, { useState } from "react";
import {
  RadioGroup,
  Radio,
  Stack,
  Box,
  FormLabel,
  Select,
  HStack,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import DotPlot from "./DotPlot.jsx";
import BarPlot from "./BarPlot.jsx";
import EnrichmentTable from "./EnrichmentTable.jsx"; // Import the new component
import EnrichmentInputTable from "./EnrichmentInputTable.jsx";

const EnrichmentAnalysisMain = ({ data, enrichmentInput }) => {
  const [plotType, setPlotType] = useState("Dot");
  const [resultType, setResultType] = useState("upregulated");
  const [colorBy, setColorBy] = useState("Odds Ratio");
  const [sortBy, setSortBy] = useState("Odds Ratio");
  const [sizeBy, setSizeBy] = useState("Odds Ratio");
  const [xAxisData, setXAxisData] = useState("Odds Ratio");
  const [topNTerms, setTopNTerms] = useState(10);

  const filterStyle = {
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
    paddingRight: "15px",
  };

  // Sort and filter the data based on resultType
  const allData = {
    Term: data[resultType].Term,
    Overlap: data[resultType].Overlap,
    "Overlap Percent": data[resultType]["Overlap Percent"],
    "P-value": data[resultType]["P-value"],
    "-log10P-value": data[resultType]["-log10P-value"],
    "Adjusted P-value": data[resultType]["Adjusted P-value"],
    "-log10Adjusted P-value": data[resultType]["-log10Adjusted P-value"],
    "Odds Ratio": data[resultType]["Odds Ratio"],
    "Combined Score": data[resultType]["Combined Score"],
    Genes: data[resultType].Genes,
  };

  // Create an array of objects for sorting and include all relevant data
  const sortableData = allData.Term.map((term, index) => ({
    term,
    xAxisValue: allData[xAxisData][index],
    colorValue: allData[colorBy][index],
    sortValue: allData[sortBy][index],
    sizeValue: allData[sizeBy][index],
    overlap: allData.Overlap[index],
    overlapPercent: allData["Overlap Percent"][index],
    pValue: allData["P-value"][index],
    adjustedPValue: allData["Adjusted P-value"][index],
    combinedScore: allData["Combined Score"][index],
    oddsRatio: allData["Odds Ratio"][index],
  }));

  // Sort and slice for top N terms
  sortableData.sort((a, b) => b.sortValue - a.sortValue);

  // Complete filteredData with all necessary properties for tooltip
  const filteredData = {
    Term: sortableData.slice(0, topNTerms).map((d) => d.term),
    [xAxisData]: sortableData.slice(0, topNTerms).map((d) => d.xAxisValue),
    [colorBy]: sortableData.slice(0, topNTerms).map((d) => d.colorValue),
    [sortBy]: sortableData.slice(0, topNTerms).map((d) => d.sortValue),
    [sizeBy]: sortableData.slice(0, topNTerms).map((d) => d.sizeValue),
    Overlap: sortableData.slice(0, topNTerms).map((d) => d.overlap),
    "Overlap Percent": sortableData
      .slice(0, topNTerms)
      .map((d) => d.overlapPercent),
    "P-value": sortableData.slice(0, topNTerms).map((d) => d.pValue),
    "Adjusted P-value": sortableData
      .slice(0, topNTerms)
      .map((d) => d.adjustedPValue),
    "Combined Score": sortableData
      .slice(0, topNTerms)
      .map((d) => d.combinedScore),
    "Odds Ratio": sortableData.slice(0, topNTerms).map((d) => d.oddsRatio),
  };

  // Size By Filter display logic
  const renderSizeByFilter = plotType === "Dot";

  return (
    <Box>
      <Accordion allowToggle mt={4}>
        <AccordionItem>
          <AccordionButton>
            <Box flex="1" textAlign="left">
              Enrichment Input Table
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {enrichmentInput && <EnrichmentInputTable data={enrichmentInput} />}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      <HStack
        mb={4}
        wrap="wrap"
        spacing={4}
        bg="#f5f5f5"
        p="16px"
        borderRadius="xl"
        w="fit-content"
        mx="auto"
        mt="20px"
        shadow="sm"
      >
        <Box style={filterStyle}>
          <FormLabel>Select Plot type:</FormLabel>
          <RadioGroup onChange={setPlotType} value={plotType}>
            <Stack direction="row" spacing={4}>
              <Radio value="Dot">Dot</Radio>
              <Radio value="Bar">Bar</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box style={filterStyle}>
          <FormLabel>Select Result Type:</FormLabel>
          <RadioGroup onChange={setResultType} value={resultType}>
            <Stack direction="row" spacing={4}>
              <Radio value="upregulated">Upregulated</Radio>
              <Radio value="downregulated">Downregulated</Radio>
              <Radio value="combined">Combined</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box style={filterStyle}>
          <FormLabel>Color By:</FormLabel>
          <Select
            defaultValue={colorBy}
            onChange={(e) => setColorBy(e.target.value)}
          >
            <option value="Overlap Percent">Overlap Percent</option>
            <option value="-log10P-value">-log10P-value</option>
            <option value="-log10Adjusted P-value">
              -log10Adjusted P-value
            </option>
            <option value="Odds Ratio">Odds Ratio</option>
            <option value="Combined Score">Combined Score</option>
          </Select>
        </Box>

        <Box style={filterStyle}>
          <FormLabel>Sort By:</FormLabel>
          <Select
            defaultValue={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="Overlap Percent">Overlap Percent</option>
            <option value="-log10P-value">-log10P-value</option>
            <option value="-log10Adjusted P-value">
              -log10Adjusted P-value
            </option>
            <option value="Odds Ratio">Odds Ratio</option>
            <option value="Combined Score">Combined Score</option>
          </Select>
        </Box>

        {renderSizeByFilter && (
          <Box style={filterStyle}>
            <FormLabel>Size By:</FormLabel>
            <Select
              defaultValue={sizeBy}
              onChange={(e) => setSizeBy(e.target.value)}
            >
              <option value="Overlap Percent">Overlap Percent</option>
              <option value="-log10P-value">-log10P-value</option>
              <option value="-log10Adjusted P-value">
                -log10Adjusted P-value
              </option>
              <option value="Odds Ratio">Odds Ratio</option>
              <option value="Combined Score">Combined Score</option>
            </Select>
          </Box>
        )}

        <Box style={filterStyle}>
          <FormLabel>X-axis Data:</FormLabel>
          <Select
            defaultValue={xAxisData}
            onChange={(e) => setXAxisData(e.target.value)}
          >
            <option value="Overlap Percent">Overlap Percent</option>
            <option value="-log10P-value">-log10P-value</option>
            <option value="-log10Adjusted P-value">
              -log10Adjusted P-value
            </option>
            <option value="Odds Ratio">Odds Ratio</option>
            <option value="Combined Score">Combined Score</option>
          </Select>
        </Box>

        <Box style={filterStyle}>
          <FormLabel>Top N terms:</FormLabel>
          <Input
            type="number"
            value={topNTerms}
            onChange={(e) => setTopNTerms(e.target.value)}
            min={1}
          />
        </Box>
      </HStack>
      <Box
        position="relative"
        height="70vh"
        overflowY="scroll"
        border="1px solid rgba(0,0,0, 0.1)"
      >
        {plotType === "Dot" ? (
          <DotPlot
            plotData={filteredData}
            xAxisData={xAxisData}
            sizeBy={sizeBy}
            colorBy={colorBy}
          />
        ) : (
          <BarPlot
            plotData={filteredData}
            xAxisData={xAxisData}
            sizeBy={sizeBy}
            colorBy={colorBy}
          />
        )}
      </Box>

      {/* Render the EnrichmentTable component with the raw data filtered by result type */}
      <EnrichmentTable tableData={data[resultType]} />
    </Box>
  );
};

export default EnrichmentAnalysisMain;
