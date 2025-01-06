import { Box } from "@chakra-ui/react";
import React, { useCallback, useMemo, useEffect } from "react";
import { FaArrowDown, FaWindowClose } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  MiniMap,
  Handle,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

const PipelineFlowchartWrapper = ({
  studyId,
  pipelineTree,
  activeNodeId,
  setShowPipeline,
}) => {
  return (
    <ReactFlowProvider>
      <PipelineFlowchart
        studyId={studyId}
        pipelineTree={pipelineTree}
        activeNodeId={activeNodeId}
        setShowPipeline={setShowPipeline}
      />
    </ReactFlowProvider>
  );
};

const PipelineFlowchart = ({
  pipelineTree,
  studyId,
  activeNodeId,
  setShowPipeline,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow(); // Get the fitView function

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useEffect(() => {
    const { nodes, edges } = createNodesAndEdges(
      pipelineTree,
      studyId,
      activeNodeId,
      setShowPipeline
    );
    setNodes(nodes);
    setEdges(edges);
  }, [pipelineTree, studyId, activeNodeId]);

  // Focus on the active node after nodes are set
  useEffect(() => {
    if (nodes.length > 0) {
      const activeNode = nodes.find(
        (node) => node.data.nodeId === activeNodeId
      );
      if (activeNode) {
        fitView({ nodes: [activeNode], duration: 800, padding: 0.5 });
      }
    }
  }, [nodes, activeNodeId, fitView]);

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "600px",
        border: "1px solid rgba(0,0,0,0.2)",
        borderRadius: "5px",
      }}
    >
      <Box
        position="absolute"
        right="2"
        top="1"
        zIndex={1000}
        onClick={() => setShowPipeline(false)}
        cursor="pointer"
      >
        <FaWindowClose size={28} />
      </Box>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        nodeTypes={nodeTypes}
        nodesDraggable={false} // Disable dragging for all nodes
      >
        <Controls />
        <Background />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

const createNodesAndEdges = (tree, studyId, currentNodeId, setShowPipeline) => {
  let nodes = [];
  let edges = [];
  let id = 0;

  const traverse = (node, x, y, parentId = null) => {
    const currentId = id++;
    const isActive = node.is_active !== false;
    const nodeContent = node.node_label;
    const estimatedWidth = nodeContent.length * 10; // Adjusted estimation for spacing
    const nodeWidth = Math.max(200, estimatedWidth);
    const nodeHeight = 60;

    // Dynamic horizontal spacing
    const horizontalSpacing = calculateHorizontalSpacing(node);
    const verticalSpacing = 180;

    nodes.push({
      id: currentId.toString(),
      position: { x, y },
      draggable: false,
      data: {
        label: nodeContent,
        isActive,
        studyId,
        nodeId: node.node_id,
        isCurrent: node.node_id === currentNodeId,
        setShowPipeline,
      },
      style: {
        width: nodeWidth,
        height: nodeHeight,
      },
      type: "customNode",
    });

    if (parentId !== null) {
      edges.push({
        id: `e${parentId}-${currentId}`,
        source: parentId.toString(),
        target: currentId.toString(),
        type: "smoothstep",
        markerEnd: {
          type: "arrowclosed", // Use custom path for the arrowhead
          strokeWidth: 8, // Adjust stroke width for the arrow
        },
      });
    }

    if (node.children && node.children.length > 0) {
      const startX = x - (horizontalSpacing * (node.children.length - 1)) / 2;
      node.children.forEach((child, index) => {
        traverse(
          child,
          startX + index * horizontalSpacing,
          y + verticalSpacing,
          currentId
        );
      });
    }
  };

  traverse(tree, 0, 0);

  return { nodes, edges };
};

// Function to calculate dynamic horizontal spacing
const calculateHorizontalSpacing = (node) => {
  const baseSpacing = 250; // Base spacing for each child
  const maxSpacing = 1500; // Max spacing if there are too many children

  const childCount = node.children ? node.children.length : 0;

  // Dynamically adjust spacing based on the number of children
  const spacing = Math.min(baseSpacing + childCount * 600, maxSpacing);

  return spacing;
};

const CustomNode = ({ data }) => {
  const navigate = useNavigate();

  const navigateToSummary = (event) => {
    if (data.isActive) {
      data.setShowPipeline(false);
      navigate(`/study/${data.studyId}/summary/${data.nodeId}`);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        padding: "10px",
        border: data.isActive ? "1px solid #1a192b" : "1px dashed #888",
        borderRadius: "3px",
        width: "100%",
        opacity: data.isActive ? 1 : 0.75,
        backgroundColor: data.isActive ? "#ffffff" : "#f0f0f0",
        display: "flex",
        flexDirection: "column", // Stack the label and chip vertically
        gap: "5px",
        justifyContent: "space-between", // Place the chip at the bottom
        alignItems: "center",
        cursor: data.isActive ? "pointer" : "not-allowed",
        transform: data.isCurrent && "scale(1.15)",
      }}
      className={data.isCurrent ? "border-4" : ""}
      onClick={navigateToSummary}
    >
      {data.isCurrent && (
        <div
          style={{
            position: "absolute",
            top: "-130%",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#3182ce",
            fontWeight: "bold",
            width: "max-content",
          }}
        >
          <div className="text-[1.2rem]">You're here</div>
          <div style={{ marginBottom: "4px" }}>
            <FaArrowDown size="1.5rem" />
          </div>
        </div>
      )}
      <div> {data.label.split(":")[0].split("_").join(" ")}</div>

      {data.label.split(":")[1] && (
        <div
          className="block text-xs px-3 py-1 rounded-full text-white font-sm shadow-sm"
          style={{ backgroundColor: "#3182ce" }}
        >
          {data.label.split(":")[1]}
        </div>
      )}

      <Handle type="target" position="top" />
      <Handle type="source" position="bottom" />
    </div>
  );
};

export default PipelineFlowchartWrapper;
