// import React, { useState, useEffect, useCallback } from "react";
// import { Box, Text, Input } from "@chakra-ui/react";
// import axios from "axios";
// import { useSearchParams } from "react-router-dom";
// import StudyCard from "./StudyCard";
// import StudyFilter from "./StudyFilter"; // Separate StudyFilter component

// const StudyList = () => {
//   const [searchParams] = useSearchParams(); // Hook to get query parameters
//   const [allStudies, setAllStudies] = useState([]); // Store the fetched study data
//   const [filteredStudies, setFilteredStudies] = useState([]); // Store the filtered studies to be displayed
//   const [loading, setLoading] = useState(false); // Show loading state
//   const [error, setError] = useState(""); // Handle error state
//   const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering studies by title

//   // Extract initial filter values from query parameters
//   const initialFilters = {
//     disease: searchParams.getAll("disease"),
//     tissue: searchParams.getAll("tissue"),
//     organism: searchParams.getAll("organism"),
//     source: searchParams.getAll("source"),
//   };

//   // Fetch studies based on filters from query parameters
//   const fetchStudies = async () => {
//     setLoading(true);
//     setError("");

//     // Convert filters to string format as required by the API
//     const processFilters = (filters) => {
//       const processed = {};
//       for (const key in filters) {
//         // TODO: Not sure about this. Check this again when more studies will be added.
//         if (Array.isArray(filters[key]) && filters[key].length > 0) {
//           // Join array values with commas
//           processed[key] = filters[key].join(",");
//         } else if (filters[key] !== null && filters[key] !== undefined) {
//           // Handle non-array values
//           processed[key] = filters[key];
//         }
//       }
//       return processed;
//     };

//     try {
//       const processedFilters = processFilters(initialFilters);
//       const response = await axios.get("/api/studies", {
//         params: processedFilters,
//       });
//       setAllStudies(response.data);
//       setFilteredStudies(response.data);
//     } catch (err) {
//       setError("Failed to load studies. Please try again.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch studies when query parameters change
//   useEffect(() => {
//     fetchStudies();
//   }, [searchParams]); // Re-run when searchParams change

//   // Function to handle filtering studies from the filter section
//   const handleFilterChange = useCallback((filters) => {
//     let filtered = allStudies;

//     // Apply each filter locally on the studies list

//     // Filter by Assay Type
//     if (filters.assay_type && filters.assay_type.length > 0) {
//       filtered = filtered.filter((study) =>
//         filters.assay_type.includes(study.assay_type)
//       );
//     }

//     // Filter by Diseases (arrays)
//     if (filters.disease && filters.disease.length > 0) {
//       filtered = filtered.filter((study) =>
//         study.diseases.some((disease) => filters.disease.includes(disease))
//       );
//     }

//     // Filter by Tissues (arrays)
//     if (filters.tissue && filters.tissue.length > 0) {
//       filtered = filtered.filter((study) =>
//         study.tissues.some((tissue) => filters.tissue.includes(tissue))
//       );
//     }

//     // Filter by Organism (arrays)
//     if (filters.organism && filters.organism.length > 0) {
//       filtered = filtered.filter((study) =>
//         study.organisms.some((organism) => filters.organism.includes(organism))
//       );
//     }

//     // Filter by Source (single value)
//     if (filters.source && filters.source.length > 0) {
//       filtered = filtered.filter((study) =>
//         filters.source.includes(study.source)
//       );
//     }

//     // If search term exists, filter by search term in title
//     if (searchTerm.trim() !== "") {
//       filtered = filtered.filter((study) =>
//         study.title.toLowerCase().includes(searchTerm.toLowerCase())
//       );
//     }

//     // Apply the filtered list to the state to display
//     setFilteredStudies(filtered);
//   });

//   return (
//     <div className="max-w-screen-xl flex">
//       {/* Filter section on the left */}
//       {/* <Box width="200px" flexShrink={0}>
//         <StudyFilter
//           onFilterChange={handleFilterChange}
//           initialFilters={initialFilters}
//         />
//       </Box> */}

//       {/* Main content (Studies List) */}
//       <Box flex="1" padding={4}>
//         <Text as="h1" fontSize="3xl" mb={6} fontWeight="500">
//           Studies
//         </Text>

//         {/* Search Input */}
//         <Box mb={12}>
//           <Input
//             borderRadius="24px"
//             placeholder="Search for a particular study"
//             size="lg"
//             value={searchTerm}
//             onChange={(e) => {
//               setSearchTerm(e.target.value);
//               handleFilterChange({ searchTerm: e.target.value });
//             }}
//           />
//         </Box>

//         {/* Display studies */}
//         {loading ? (
//           <Text>Loading studies...</Text>
//         ) : error ? (
//           <Text color="red.500">{error}</Text>
//         ) : (
//           <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filteredStudies.length > 0 ? (
//               filteredStudies.map((study) => (
//                 <StudyCard key={study.id} study={study} />
//               ))
//             ) : (
//               <Text>No studies found. Try different filters.</Text>
//             )}
//           </Box>
//         )}
//       </Box>
//     </div>
//   );
// };

// export default StudyList;
