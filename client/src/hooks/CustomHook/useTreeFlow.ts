import { useCallback, useMemo, useState } from 'react';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';

// import axios from 'axios';
import { useTreeFlowContext } from '@context/TreeFlowContext';
// import { useAppSelector } from '@store/reduxHooks';

export const useTreeFlow = () => {
  const [baseNodes, setBaseNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  // Track node states: normal -> strikethrough -> closing -> removed
  const [strikethroughNodes, setStrikethroughNodes] = useState<Set<string>>(
    new Set()
  );

  // Enhanced toggle handler - just toggles strikethrough on/off
  const handleNodeClose = useCallback(
    (nodeId: string) => {
      const isStrikethrough = strikethroughNodes.has(nodeId);

      if (!isStrikethrough) {
        // First click: Add strikethrough
        console.log('Adding strikethrough to node:', nodeId);
        setStrikethroughNodes((prev) => new Set([...prev, nodeId]));
      } else {
        // Second click: Remove strikethrough (back to normal)
        console.log('Removing strikethrough from node:', nodeId);
        setStrikethroughNodes((prev) => {
          const newSet = new Set(prev);
          newSet.delete(nodeId);
          return newSet;
        });
      }
    },
    [strikethroughNodes]
  );

  // Enrich nodes with strikethrough and closing states
  const optimizedNodes = useMemo(() => {
    return baseNodes.map((node) => {
      if (node.type === 'custom') {
        const isStrikethrough = strikethroughNodes.has(node.id);

        return {
          ...node,

          data: {
            ...node.data,
            isStrikethrough,
            onClose: handleNodeClose,
          },
        };
      }
      return {
        ...node,
      };
    });
  }, [baseNodes, strikethroughNodes, handleNodeClose]);

  // Standard React Flow handlers
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setBaseNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((es) => addEdge(params, es)),
    []
  );

  const [rootModalOpen, setRootModalOpen] = useState(false);

  const handleNodeClick = useCallback(
    (event: MouseEvent, node: Node) => {
      setCourseId(node.data.courseId);
      setNodeName(node.id);

      if (node.data.title === 'root') {
        setRootModalOpen(true);
      } else {
        setTitle(node.data.title);
        setDrawerOpen(true);
      }
    },
    [setCourseId, setNodeName, setTitle, setDrawerOpen]
  );

  return {
    nodes: optimizedNodes,
    edges,
    setNodes: setBaseNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    setDrawerOpen,
    rootModalOpen,
    setRootModalOpen,

    // Debug/utility info
    strikethroughCount: strikethroughNodes.size,
    totalNodes: baseNodes.length,
    strikethroughNodeIds: Array.from(strikethroughNodes),
  };
};
