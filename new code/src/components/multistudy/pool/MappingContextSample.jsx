// import React, { createContext, useState } from "react";

// // Create a context
// export const MappingContextSample = createContext();

// export const MappingProvider = ({ children }) => {
//   const [mappings, setMappings] = useState({});
//   const [sampleLevelMappings, setSampleLevelMappings] = useState({});

//   // Function to update the mapping for a specific cellTypeLevel
//   const saveMapping = (level, boxes) => {
//     setMappings((prevMappings) => ({
//       ...prevMappings,

//       [level]: boxes,
//     }));
//   };

//   // Function to save sample level mappings
//   const saveSampleLevelMapping = (data) => {
//     setSampleLevelMappings(data);
//   };

//   return (
//     <MappingContextSample.Provider
//       value={{
//         mappings,
//         saveMapping,
//         sampleLevelMappings,
//         saveSampleLevelMapping,
//       }}
//     >
//       {children}
//     </MappingContextSample.Provider>
//   );
// };
