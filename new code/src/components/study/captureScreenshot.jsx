import React from "react";
import { createRoot } from "react-dom/client";
import html2canvas from "html2canvas-pro";
import CellParentComponent from "../explorer/boxplot/cell/CellParentComponent";
import DotPlot from "../explorer/enrichment-analysis/DotPlot";
import DgeAnalysisMain from "../explorer/dge-analysis/DgeAnalysisMain";
import CellUmap from "../explorer/umaps/CellUmap";
import { ChakraProvider } from "@chakra-ui/react";

export const captureCellUmapScreenshot = async (plotData, plotLabel, scope) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    container.style.width = "1500px";
    container.style.border = "1px solid #d9d9d9";

    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <ChakraProvider>
        <CellUmap
          plotData={plotData}
          plotLabel={plotLabel}
          includeTable={false}
          scope={scope}
        />
      </ChakraProvider>
    );

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          logging: true,
          useCORS: true,
          scale: 2,
        });
        const dataUrl = canvas.toDataURL("image/png");
        root.unmount();
        document.body.removeChild(container);
        resolve(dataUrl);
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 3000);
  });
};

export const captureBoxPlotScreenshot = async (plotData, splitProp, scope) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <ChakraProvider>
        <CellParentComponent
          plotData={plotData}
          split_prop={splitProp}
          includeTable={false}
          scope={scope} // Ensure table is not rendered for the screenshot
        />
      </ChakraProvider>
    );

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          logging: false,
          useCORS: true,
          willReadFrequently: true,
        });
        const dataUrl = canvas.toDataURL("image/png");
        // console.log("Base64 Image:", dataUrl);
        root.unmount();
        document.body.removeChild(container);
        resolve(dataUrl);
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 1000);
  });
};

export const captureEnrichmentScreenshot = async (
  enrichmentData,
  xAxisData,
  sizeBy,
  colorBy
) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    container.style.width = "1200px"; // Explicit width
    container.style.height = "800px"; // Explicit height
    container.style.background = "white";
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.boxSizing = "border-box";
    document.body.appendChild(container);

    const root = createRoot(container);

    console.log("Rendering DotPlot with data:", {
      enrichmentData,
      xAxisData,
      sizeBy,
      colorBy,
    });

    root.render(
      <ChakraProvider>
        <DotPlot
          plotData={enrichmentData} // Ensure this is properly formatted
          xAxisData={xAxisData}
          sizeBy={sizeBy}
          colorBy={colorBy}
          width={1200} // If DotPlot accepts explicit dimensions
          height={800}
        />
      </ChakraProvider>
    );

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          logging: true,
          useCORS: true,
          scale: 2, // Higher resolution
        });
        console.log(
          "Canvas Width:",
          canvas.width,
          "Canvas Height:",
          canvas.height
        );
        const dataUrl = canvas.toDataURL("image/png");
        root.unmount();
        document.body.removeChild(container);
        resolve(dataUrl);
      } catch (err) {
        console.error("Error capturing screenshot:", err);
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 2000); // Adjust this delay if needed
  });
};


export const captureDgeScreenshot = async (
  dgeData,
  initialFoldChangeThreshold,
  initialSignificanceThreshold
) => {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.top = "-10000px";
    container.style.left = "-10000px";
    container.style.width = "1200px"; // Ensure width encompasses entire component rendering
    container.style.height = "500px"; // Ensure height is sufficient
    container.style.background = "white";
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <DgeAnalysisMain
          includeTable={false}
          data={dgeData}
          initialFoldChangeThreshold={initialFoldChangeThreshold}
          initialSignificanceThreshold={initialSignificanceThreshold}
        />
      </React.StrictMode>
    );

    setTimeout(async () => {
      try {
        const canvas = await html2canvas(container, {
          logging: false,
          useCORS: true, // Ensure cross-origin images are handled
          willReadFrequently: true, // Improve performance on frequent readbacks
        });
        const dataUrl = canvas.toDataURL("image/png");
        root.unmount();
        document.body.removeChild(container);
        resolve(dataUrl);
      } catch (err) {
        root.unmount();
        document.body.removeChild(container);
        reject(err);
      }
    }, 2000); // Adjust delay as needed
  });
};
