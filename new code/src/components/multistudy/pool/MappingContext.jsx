import React, { createContext, useState } from "react";

// Create a single context
export const MappingContext = createContext();

export const MappingProvider = ({ children }) => {
  // State for cell level mappings
  const [cellLevelMappings, setCellLevelMappings] = useState({});

  // State for sample level mappings
  const [sampleLevelMappings, setSampleLevelMappings] = useState({});

  // Function to update mappings for a specific cellTypeLevel
  const saveCellLevelMapping = (level, boxes) => {
    setCellLevelMappings((prevMappings) => ({
      ...prevMappings,
      [level]: boxes, // Save or update mappings for the given cellTypeLevel
    }));
  };

  // Function to save sample level mappings
  const saveSampleLevelMapping = (data) => {
    setSampleLevelMappings(data);
  };

  return (
    <MappingContext.Provider
      value={{
        cellLevelMappings,
        saveCellLevelMapping,
        sampleLevelMappings,
        saveSampleLevelMapping,
      }}
    >
      {children}
    </MappingContext.Provider>
  );
};