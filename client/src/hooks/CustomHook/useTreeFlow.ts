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
import useGetAllMark from '@hooks/ReactQueryHook/courses/useGetAllMark';

const useTreeFlow = () => {
  const [baseNodes, setBaseNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  // Fetch all marks in one request
  const { allMarks, isLoading: marksLoading } = useGetAllMark();

  // React Query integration for completed courses
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
      if (isMutating) return;

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

  // Enrich nodes with completion state and marks (no hover state needed)
  const optimizedNodes = useMemo(() => {
    return baseNodes.map((node) => {
      if (node.type === 'custom' && node.data.courseId) {
        const isCompleted = completedCourses.has(Number(node.data.courseId));
        const courseId = Number(node.data.courseId);
        const mark = allMarks[courseId];

        return {
          ...node,
          data: {
            ...node.data,
            isStrikethrough: isCompleted,
            onClose: handleNodeClose,
            isUpdating: isMutating,
            mark, // Always pass the mark, CSS will handle visibility
          },
        };
      }
      return node;
    });
  }, [baseNodes, completedCourses, handleNodeClose, isMutating, allMarks]);

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

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
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
    onConnect,
    handleNodeClick,
    setDrawerOpen,
    rootModalOpen,
    setRootModalOpen,

    // React Query states
    loading: loading || marksLoading,
    error: combinedError,
    isMutating,
    completedCoursesCount: completedCourses.size,
    totalNodes: baseNodes.length,
    completedCourseIds: Array.from(completedCourses),
  };
};

export default useTreeFlow;
