import axios from "axios";

export const getStudyData = async (
  studyId,
  nodeId,
  setStudy,
  setActiveNode
) => {
  try {
    const response = await axios.get(`/api/studies/${studyId}`);
    setStudy(response.data);

    if (response.data.pipeline_tree) {
      const activeNode = getCurrentActiveNodeData(
        response.data.pipeline_tree,
        nodeId
      );
      setActiveNode(activeNode);
    }
  } catch (error) {
    console.error("Failed to load study details:", error);
  }
};

export const getCurrentActiveNodeData = (node, nodeId) => {
  if (node.is_active && node.node_id === nodeId) {
    return node;
  }

  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      const activeNode = getCurrentActiveNodeData(child, nodeId);
      if (activeNode) {
        return activeNode;
      }
    }
  }

  return null; // Return null if no active node is found
};
