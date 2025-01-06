// Import axios and captureScreenshot functionality
import axios from "axios";
import { captureBoxPlotScreenshot } from "./captureScreenshot";
import { captureEnrichmentScreenshot } from "./captureScreenshot";
import { captureDgeScreenshot } from "./captureScreenshot";
import { captureCellUmapScreenshot } from "./captureScreenshot";

// Prepare parameters for DGE requests
const prepareDgeParams = (config) => {
  return {
    split_by_key: config.split_by_key,
    comparison: config.comparison,
    cell_type_level: config.cell_type_level,
    cell_type: config.cell_type,
    shrinkage: config.shrinkage,
  };
};

// Prepare parameters for enrichment analysis POST request
const prepareEnrichmentPostParams = (config) => {
  return {
    upregulated: config.upregulated,
    downregulated: config.downregulated,
    cutoff: config.cutoff,
    gene_set: config.gene_set,
  };
};

// General parameter preparation for UMAP and boxplot
// const prepareGeneralParams = (config) => {
//   return {
//     ...config,
//     anndata_filename: "kawasaki",
//   };
// };

// Main fetch function
export const fetchFigureData = async (figType, config, figure, nodeId) => {
  try {
    let apiUrl = "";
    let params = {};

    // Choose correct parameter preparation function
    switch (figType) {
      case "cell_umap":
      case "gene_umap":
        apiUrl = `/api/${nodeId}/umaps/data`;
        params = config;
        break;
      case "cell_boxplot":
        apiUrl = `/api/${nodeId}/boxplots/cell-proportions`;
        params = config;
        break;
      case "gene_boxplot":
        apiUrl = `/api/${nodeId}/boxplots/gene-expression`;
        params = config;
        break;
      case "dge":
        apiUrl = `/api/${nodeId}/dge/result`;
        params = prepareDgeParams(config);
        break;
      case "enrichment":
        apiUrl = "/api/ea/apply-enrichment";
        params = prepareEnrichmentPostParams(config);
        break;
      default:
        throw new Error(`Unsupported fig_type: ${figType}`);
    }

    const options = {
      method: figType === "enrichment" ? "post" : "get",
      url: apiUrl,
      data: figType === "enrichment" ? params : null,
      params: figType !== "enrichment" ? params : null,
    };

    const extractDotPlotParams = (config) => {
      return {
        xAxisData: config.x_axis_data,
        sizeBy: config.size_by,
        colorBy: config.color_by,
        sortBy: config.sort_by,
        topNTerms: config.top_n_terms,
        resultType: config.result_type,
      };
    };

    const prepareEnrichmentData = (
      data,
      resultType,
      xAxisData,
      colorBy,
      sortBy,
      sizeBy,
      topNTerms
    ) => {
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

      return filteredData;
    };

    // Execute request
    const response = await axios(options);

    // console.log(`Response for ${figType}:`, response.data);

    if (figType === "cell_umap") {
      const plotData = response.data;
      const scope = figure.scope;
      // console.log(scope);

      // console.log(config);
      let splitByValsVsSamples;

      try {
        splitByValsVsSamples = JSON.parse(config.split_by_vals_vs_samples);
      } catch (error) {
        console.error(
          "Failed to parse config.split_by_vals_vs_samples:",
          error
        );
      }

      // Check if parsing was successful and proceed
      let plotLabel = [];
      if (Array.isArray(splitByValsVsSamples)) {
        plotLabel = splitByValsVsSamples.map((item) => item.split_by_val);
      } else {
        console.error(
          "splitByValsVsSamples is not an array after parsing:",
          splitByValsVsSamples
        );
      }

      const screenshot = await captureCellUmapScreenshot(
        plotData,
        plotLabel,
        scope
      );
      return { screenshot };
    }

    // if (figType === "cell_umap") {
    //   const plotData = response.data;
    //   console.log(config);
    //   let splitByValsVsSamples;

    //   // Retain configuration outputs
    //   try {
    //     splitByValsVsSamples = JSON.parse(config.split_by_vals_vs_samples);
    //   } catch (error) {
    //     console.error("Failed to parse config.split_by_vals_vs_samples:", error);
    //   }

    //   let plotLabel = [];
    //   if (Array.isArray(splitByValsVsSamples)) {
    //     plotLabel = splitByValsVsSamples.map((item) => item.split_by_val);
    //   } else {
    //     console.error("splitByValsVsSamples is not an array after parsing:", splitByValsVsSamples);
    //   }

    //   console.log(plotLabel);
    //   console.log(plotData);

    //   // Return plotData to be used in CellUmapPlot component
    //   return { plotData };
    // }
    else if (figType === "cell_boxplot") {
      const plotData = response.data;
      const scope = figure.scope;

      // Parse split_by_vals from string to a1rray
      let splitProp = [];
      try {
        splitProp = JSON.parse(config.split_by_vals);
      } catch (error) {
        console.error("Error parsing split_by_vals:", error);
      }

      const screenshot = await captureBoxPlotScreenshot(
        plotData,
        splitProp,
        scope
      );
      return { screenshot, plotData }; // Return plotData for use in BoxPlotTable
    } else if (figType === "enrichment") {
      const enrichmentData = response.data;
      // console.log(response.data);
      const { xAxisData, sizeBy, colorBy, sortBy, topNTerms, resultType } =
        extractDotPlotParams(config);

      // Prepare filtered data using the utility function
      const filteredData = prepareEnrichmentData(
        enrichmentData,
        resultType,
        xAxisData,
        colorBy,
        sortBy,
        sizeBy,
        topNTerms
      );

      const screenshot = await captureEnrichmentScreenshot(
        filteredData,
        xAxisData,
        sizeBy,
        colorBy
      );

      // console.log(response.data[resultType]);
      const tableDataEnrichment = response.data[resultType];
      return { screenshot, tableDataEnrichment };
    } else if (figType === "dge") {
      const dgeData = response.data;
      // console.log("Fetched DGE Data:", dgeData); // Check the structure here
      const initialFoldChangeThreshold = config.log2_fold_change || 1;
      const initialSignificanceThreshold = config.negative_log10_pvalue || 1.3;

      const screenshot = await captureDgeScreenshot(
        dgeData,
        initialFoldChangeThreshold,
        initialSignificanceThreshold
      );
      return {
        screenshot,
        dgeData,
        initialFoldChangeThreshold,
        initialSignificanceThreshold,
      };
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching data for fig_type ${figType}:`, error);
    throw error;
  }
};
