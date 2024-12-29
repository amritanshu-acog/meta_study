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
  Checkbox,
  CheckboxGroup,
  Text,
} from "@chakra-ui/react";
import DotPlot from "./DotPlot.jsx";
import EnrichmentTable from "./EnrichmentTable.jsx";
import EnrichmentInputTable from "./EnrichmentInputTable.jsx";

const EnrichmentAnalysisMain = ({ data, enrichmentInput }) => {
  const [plotType, setPlotType] = useState("Dot");
  const [resultType, setResultType] = useState("upregulated");
  const [colorBy, setColorBy] = useState("Odds Ratio");
  const [sizeBy, setSizeBy] = useState("Odds Ratio");
  const xAxisData = "Term";

  const [topNTerms, setTopNTerms] = useState(10);
  const [selectedStudy, setSelectedStudy] = useState("All");
  const selectedStudyData =
    selectedStudy === "All"
      ? data.map((studyData) => ({
          study: studyData?.study || "Unknown Study",
          data: studyData?.data?.[resultType] || [],
        }))
      : data.find((studyData) => studyData.study === selectedStudy)?.data[
          resultType
        ];

  if (!selectedStudyData) {
    return <p>No data available for the selected study.</p>;
  }

  // Aggregate data when "All" is selected
  const allData =
    selectedStudy === "All"
      ? data.map((studyData) => ({
          study: studyData.study,
          terms: studyData.data[resultType].Term.map((term, index) => ({
            term,
            overlap: studyData.data[resultType].Overlap[index],
            overlapPercent:
              studyData.data[resultType]["Overlap Percent"][index],
            pValue: studyData.data[resultType]["P-value"][index],
            adjustedPValue:
              studyData.data[resultType]["Adjusted P-value"][index],
            oddsRatio: studyData.data[resultType]["Odds Ratio"][index],
            combinedScore: studyData.data[resultType]["Combined Score"][index],
            genes: studyData.data[resultType].Genes[index],
          })),
        }))
      : [
          {
            study: selectedStudy,
            terms: selectedStudyData.Term.map((term, index) => ({
              term,
              overlap: selectedStudyData.Overlap[index],
              overlapPercent: selectedStudyData["Overlap Percent"][index],
              pValue: selectedStudyData["P-value"][index],
              adjustedPValue: selectedStudyData["Adjusted P-value"][index],
              oddsRatio: selectedStudyData["Odds Ratio"][index],
              combinedScore: selectedStudyData["Combined Score"][index],
              genes: selectedStudyData.Genes[index],
            })),
          },
        ];

  const convertFilterName = (name) => {
    // Convert display names to property names
    switch (name) {
      case "Odds Ratio":
        return "oddsRatio";
      case "Combined Score":
        return "combinedScore";
      case "P-value":
        return "pValue";
      case "Adjusted P-value":
        return "adjustedPValue";
      case "Overlap":
        return "overlap";
      case "Overlap Percent":
        return "overlapPercent";
      case "-log10P-value":
        return "pValue"; // Added mapping for -log10P-value
      case "-log10Adjusted P-value":
        return "adjustedPValue"; // Added mapping for -log10Adjusted P-value
      default:
        return name.toLowerCase().replace(/\s+/g, "");
    }
  };

  const filteredData =
    selectedStudy === "All"
      ? data.map((studyData) => ({
          selectedStudy: [studyData.study], // Wrap each study in an array
          studyTermData: [
            {
              study: studyData.study,
              // Map terms dynamically based on the sizeBy and colorBy
              terms: allData
                .find((data) => data.study === studyData.study)
                .terms.slice(0, topNTerms)
                .map((termData) => ({
                  term: termData.term, // Term
                  sizeValue: termData[convertFilterName(sizeBy)], // Convert the filter name
                  colorValue: termData[convertFilterName(colorBy)], // Dynamically use the colorBy filter (e.g., 'Odds Ratio', 'Combined Score')
                })),
            },
          ],
        }))
      : [
          {
            selectedStudy: [selectedStudy], // Wrap the selected study in an array
            studyTermData: [
              {
                study: selectedStudy,
                // Map terms dynamically based on the sizeBy and colorBy
                terms: allData
                  .find((data) => data.study === selectedStudy)
                  .terms.slice(0, topNTerms)
                  .map((termData) => ({
                    term: termData.term, // Term
                    sizeValue: termData[convertFilterName(sizeBy)], // Convert the filter name
                    colorValue: termData[convertFilterName(colorBy)], // Dynamically use the colorBy filter (e.g., 'Odds Ratio', 'Combined Score')
                  })),
              },
            ],
          },
        ];

  const studiesData =
    selectedStudy === "All"
      ? allData.flatMap((study) =>
          study.terms.map((termData) => ({
            term: termData.term,
            studyname: study.study,
            sizeby: termData[convertFilterName(sizeBy)] || "N/A", // Safeguard for missing data
            colorby: termData[convertFilterName(colorBy)] || "N/A", // Safeguard for missing data
          }))
        )
      : allData
          .find((study) => study.study === selectedStudy)
          ?.terms.map((termData) => ({
            term: termData.term,
            studyname: selectedStudy,
            sizeby: termData[convertFilterName(sizeBy)] || "N/A", // Safeguard for missing data
            colorby: termData[convertFilterName(colorBy)] || "N/A", // Safeguard for missing data
          })) || [];

  const filterStyle = {
    borderRight: "1px solid rgba(0, 0, 0, 0.05)",
    paddingRight: "15px",
  };

  const handleChange = (event) => {
    setSelectedStudy(event.target.value);
  };

  const propertyToDisplayNameMap = {
    oddsRatio: "Odds Ratio",
    combinedScore: "Combined Score",
    pValue: "P-value",
    adjustedPValue: "Adjusted P-value",
    overlap: "Overlap",
    overlapPercent: "Overlap Percent",
    "-log10PValue": "-log10 P-value",
    "-log10AdjustedPValue": "-log10 Adjusted P-value",
  };

  const convertCamelToDisplayName = (camelName) =>
    propertyToDisplayNameMap[camelName] || camelName;

  // Size By Filter display logic
  const renderSizeByFilter = plotType === "Dot";
  return (
    <Box p={4} borderWidth="1px" borderRadius="lg" boxShadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Select Study to Show:
      </Text>
      <CheckboxGroup value={[selectedStudy]}>
        <Stack direction="row" spacing={3}>
          <Checkbox
            value="All"
            onChange={handleChange}
            isChecked={selectedStudy === "All"}
            size="lg"
            colorScheme="red"
          >
            All Studies
          </Checkbox>
          {data.map((studyData) => (
            <Checkbox
              key={studyData.study}
              value={studyData.study}
              onChange={handleChange}
              isChecked={selectedStudy === studyData.study}
              size="lg"
              colorScheme="red"
            >
              {studyData.study}
            </Checkbox>
          ))}
        </Stack>
      </CheckboxGroup>
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
        spacing={4}
        bg="#f5f5f5"
        p="16px"
        borderRadius="xl"
        w="100%" // Set to full width
        mx="auto"
        mt="20px"
        shadow="sm"
        overflowX="auto" // Enable horizontal scrolling if content overflows
      >
        <Box style={{ minWidth: "200px", ...filterStyle }}>
          <FormLabel>Select Result Type:</FormLabel>
          <RadioGroup onChange={setResultType} value={resultType}>
            <Stack direction="row" spacing={4}>
              <Radio value="upregulated">Upregulated</Radio>
              <Radio value="downregulated">Downregulated</Radio>
              <Radio value="combined">Combined</Radio>
            </Stack>
          </RadioGroup>
        </Box>

        <Box style={{ minWidth: "200px", ...filterStyle }}>
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

        {renderSizeByFilter && (
          <Box style={{ minWidth: "200px", ...filterStyle }}>
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

        <Box style={{ minWidth: "200px", ...filterStyle }}>
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
        marginBottom="10px"
        height="75vh"
        overflowY="scroll"
        border="1px solid rgba(0,0,0, 0.1)"
      >
        <DotPlot
          plotData={filteredData}
          xAxisData="Term"
          sizeBy={sizeBy}
          colorBy={colorBy}
        />
      </Box>

      {/* Render the EnrichmentTable component with the raw data filtered by result type */}
      <EnrichmentTable
        studiesData={studiesData}
        sizeByLabel={convertCamelToDisplayName(convertFilterName(sizeBy))}
        colorByLabel={convertCamelToDisplayName(convertFilterName(colorBy))}
      />
    </Box>
  );
};

export default EnrichmentAnalysisMain;
