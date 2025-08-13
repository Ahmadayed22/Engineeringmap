import { useState, useCallback, useMemo } from 'react';
import {
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeMouseHandler,
} from '@xyflow/react';
import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';

import { useTreeFlowContext } from '@context/TreeFlowContext';
import useCompletedCoursesWithQuery from '@hooks/ReactQueryHook/courses/useCompletedCoursesWithQuery';

const useTreeFlow = () => {
  const [baseNodes, setBaseNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  // React Query integration
  const {
    completedCourses,
    loading,
    error,
    toggleCourseCompletion,
    isMutating,
    mutationError,
  } = useCompletedCoursesWithQuery();

  // Enhanced toggle handler with React Query
  const handleNodeClose = useCallback(
    async (nodeId: string) => {
      // Prevent multiple clicks while mutation is pending
      if (isMutating) return;

      // Find the node to get its courseId
      const node = baseNodes.find((n) => n.id === nodeId);
      if (!node || !node.data.courseId) {
        console.warn('Node or courseId not found for:', nodeId);
        return;
      }

      const courseId = Number(node.data.courseId);
      await toggleCourseCompletion(courseId);
    },
    [baseNodes, toggleCourseCompletion, isMutating]
  );

  // Enrich nodes with completion state from React Query
  const optimizedNodes = useMemo(() => {
    return baseNodes.map((node) => {
      if (node.type === 'custom' && node.data.courseId) {
        const isCompleted = completedCourses.has(Number(node.data.courseId));

        return {
          ...node,
          data: {
            ...node.data,
            isStrikethrough: isCompleted,
            onClose: handleNodeClose,
            // Add loading state to individual nodes if needed
            isUpdating: isMutating,
          },
        };
      }
      return {
        ...node,
      };
    });
  }, [baseNodes, completedCourses, handleNodeClose, isMutating]);

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

  const onNodeMouseEnter: NodeMouseHandler = useCallback((event, node) => {
    console.log('Mouse entered node', node.id);
  }, []);

  const [rootModalOpen, setRootModalOpen] = useState(false);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
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

  const combinedError = error || mutationError?.message;

  return {
    nodes: optimizedNodes,
    edges,
    setNodes: setBaseNodes,
    onNodesChange,
    onEdgesChange,
    onNodeMouseEnter,
    onConnect,
    handleNodeClick,
    setDrawerOpen,
    rootModalOpen,
    setRootModalOpen,

    // React Query states
    loading,
    error: combinedError,
    isMutating,
    completedCoursesCount: completedCourses.size,
    totalNodes: baseNodes.length,
    completedCourseIds: Array.from(completedCourses),
  };
};

export default useTreeFlow;
