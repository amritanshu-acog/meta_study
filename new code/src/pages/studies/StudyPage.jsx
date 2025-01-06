// import React, { useState, useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { Box } from "@chakra-ui/react";
// import StudyPageNavbar from "../../components/UtilityNavbar";
// import StudyDetail from "../../components/study/StudyDetail";
// import Observations from "../../components/study/Observations";
// import { FaEye, FaExternalLinkAlt, FaListAlt } from "react-icons/fa";
// import axios from "axios";

// const StudyPage = () => {
//   const { studyId } = useParams();
//   const [study, setStudy] = useState(null);
//   const [activeNode, setActiveNode] = useState(null);
//   const [activeComponent, setActiveComponent] = useState("summary");

//   useEffect(() => {
//     const fetchStudy = async () => {
//       try {
//         const response = await axios.get(`/api/studies/${studyId}`);
//         // console.log(response.data);
//         setStudy(response.data);
//         const firstActiveNode = getFirstActiveNode(response.data.pipeline_tree);
//         setActiveNode(firstActiveNode);
//         console.log(firstActiveNode);
//       } catch (error) {
//         console.error("Failed to load study details:", error);
//       }
//     };
//     fetchStudy();
//   }, [studyId]);

//   function getFirstActiveNode(node) {
//     if (node.is_active) {
//       return node;
//     }

//     if (node.children && node.children.length > 0) {
//       for (const child of node.children) {
//         const activeNode = getFirstActiveNode(child);
//         if (activeNode) {
//           return activeNode;
//         }
//       }
//     }

//     return null; // Return null if no active node is found
//   }

//   const navItems = [
//     { name: "Summary", id: "summary", icon: <FaListAlt /> },
//     { name: "Observations", id: "observations", icon: <FaEye /> },
//     { name: "Explore", id: "explorer", icon: <FaExternalLinkAlt /> },
//   ];

//   return (
//     <Box>
//       <StudyPageNavbar
//         navItems={navItems}
//         activeComponent={activeComponent}
//         setActiveComponent={setActiveComponent}
//       />
//       <Box>
//         <Box display={activeComponent === "summary" ? "block" : "none"}>
//           {study && activeNode && (
//             <StudyDetail study={study} activeNode={activeNode} />
//           )}
//         </Box>
//         <Box display={activeComponent === "observations" ? "block" : "none"}>
//           {activeNode && <Observations pipelineId={activeNode.node_id} />}
//         </Box>
//       </Box>
//     </Box>
//   );
// };

// export default StudyPage;
