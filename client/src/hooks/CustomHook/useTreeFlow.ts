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

import { useTreeFlowContext } from '@context/TreeFlowContext';
import useCompletedCoursesWithQuery from '@hooks/ReactQueryHook/courses/useCompletedCoursesWithQuery';
import useGetAllMark from '@hooks/ReactQueryHook/courses/useGetAllMark';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useCourseProgress } from '@features/progress/useCourseProgress';

const HIGHLIGHT_KEY = 'engmap.highlightAvailable';
const readHighlightPref = () => {
  try {
    return localStorage.getItem(HIGHLIGHT_KEY) !== 'off';
  } catch {
    return true;
  }
};

const useTreeFlow = (initialNodes: Node[] = [], initialEdges: Edge[] = []) => {
  const [baseNodes, setBaseNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  const { allMarks, isLoading: marksLoading } = useGetAllMark();
  const { isAuthenticated } = useAuth();
  const [highlight, setHighlightState] = useState(readHighlightPref);
  const setHighlight = useCallback((on: boolean) => {
    setHighlightState(on);
    try {
      localStorage.setItem(HIGHLIGHT_KEY, on ? 'on' : 'off');
    } catch {
      // storage unavailable (private mode); the toggle still works for this visit
    }
  }, []);

  // React Query integration for completed courses
  const {
    completedCourses,
    loading,
    error,
    toggleCourseCompletion,
    isMutating,
    mutationError,
  } = useCompletedCoursesWithQuery();

  // toggle handler with React Query
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

  // Requirements come from the static plan, so layout changes never alter them.
  const progress = useCourseProgress(
    initialNodes,
    initialEdges,
    completedCourses,
    allMarks
  );
  const showStatus = isAuthenticated && highlight;

  // Enrich nodes with completion state, marks and "can I take it" status
  const customNodes = useMemo(() => {
    return baseNodes.map((node) => {
      if (node.type === 'custom' && node.data.courseId) {
        const isCompleted = completedCourses.has(Number(node.data.courseId));
        const courseId = Number(node.data.courseId);
        const mark = allMarks[courseId];
        const state = progress.states.get(courseId);
        const missingNames = (state?.missing ?? [])
          .map((id) => progress.graph.courses.get(id)?.name)
          .filter(Boolean)
          .join('، ');

        return {
          ...node,
          className: showStatus && state ? `status-${state.status}` : undefined,
          data: {
            ...node.data,
            isStrikethrough: isCompleted,
            onClose: handleNodeClose,
            isUpdating: isMutating,
            mark,
            status: showStatus ? state?.status : undefined,
            missingNames: showStatus ? missingNames : undefined,
          },
        };
      }
      return node;
    });
  }, [
    baseNodes,
    completedCourses,
    handleNodeClose,
    isMutating,
    allMarks,
    progress,
    showStatus,
  ]);

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
        // Show the course's display name in the drawer, not its internal key ("digitalLogic").
        setTitle(
          typeof node.data.label === 'string'
            ? node.data.label
            : node.data.title
        );

        setDrawerOpen(true);
      }
    },
    [setCourseId, setNodeName, setTitle, setDrawerOpen]
  );

  const combinedError = error || mutationError?.message;

  return {
    nodes: customNodes,
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
    // "What can I take next" + progress summary
    progress,
    isSignedIn: isAuthenticated,
    highlight,
    setHighlight,
  };
};

export default useTreeFlow;
