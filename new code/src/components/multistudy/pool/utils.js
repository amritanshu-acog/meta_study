import axios from "axios";

export const getStudyData = async (studyId, setStudy, setActiveNodes) => {
  try {
    const response = await axios.get(`/api/studies/${studyId}`);
    setStudy(response.data);

    if (response.data.pipeline_tree) {
      const activeNodes = findAllActiveNodes(response.data.pipeline_tree);
      setActiveNodes(activeNodes);
    } else {
      setActiveNodes([]); // Ensure to handle if there's no pipeline_tree.
    }
  } catch (error) {
    console.error("Failed to load study details:", error);
  }
};

export const findAllActiveNodes = (node) => {
  let nodes = [];
  if (node.is_active) {
    nodes.push({
      node_id: node.node_id,
      node_name: node.name || "Unnamed Node",
    });
  }
  if (node.children) {
    for (const child of node.children) {
      nodes = [...nodes, ...findAllActiveNodes(child)];
    }
  }
  return nodes;
};
