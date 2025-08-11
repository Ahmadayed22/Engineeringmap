// import { useCallback, useMemo, useState } from 'react';
// import {
//   Node,
//   Edge,
//   OnNodesChange,
//   OnEdgesChange,
//   OnConnect,
//   applyNodeChanges,
//   applyEdgeChanges,
//   addEdge,
// } from '@xyflow/react';
// import { initialNodes } from '@components/layout/node/initialNodes';
// import { initialEdges } from '@components/layout/edge/initialEdges';

// // import axios from 'axios';
// import { useTreeFlowContext } from '@context/TreeFlowContext';
// import { staticValues2 } from '@components/layout/node/StaticNodeValue';
// // import { useAppSelector } from '@store/reduxHooks';

// const useTreeFlow = () => {
//   const [baseNodes, setBaseNodes] = useState<Node[]>(initialNodes);
//   const [edges, setEdges] = useState<Edge[]>(initialEdges);
//   const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
//     useTreeFlowContext();

//   // Track node states: normal -> strikethrough -> closing -> removed
//   const [strikethroughNodes, setStrikethroughNodes] = useState<Set<string>>(
//     new Set()
//   );
//   console.log('Initial strikethrough nodes:', strikethroughNodes);

//   // Enhanced toggle handler - just toggles strikethrough on/off
//   const handleNodeClose = useCallback(
//     (nodeId: string) => {
//       const isStrikethrough = strikethroughNodes.has(nodeId);
//       const courseId = staticValues2.find((itme) => {
//         return itme.value === nodeId ? itme.id : null;
//       });

//       if (!isStrikethrough) {
//         // First click: Add strikethrough
//         console.log('Adding strikethrough to node:', nodeId);
//         console.log('courseId :', courseId);
//         setStrikethroughNodes((prev) => new Set([...prev, nodeId]));
//       } else {
//         // Second click: Remove strikethrough (back to normal)
//         console.log('Removing strikethrough from node:', nodeId);
//         setStrikethroughNodes((prev) => {
//           const newSet = new Set(prev);
//           newSet.delete(nodeId);
//           return newSet;
//         });
//       }
//     },
//     [strikethroughNodes]
//   );

//   // Enrich nodes with strikethrough and closing states
//   const optimizedNodes = useMemo(() => {
//     return baseNodes.map((node) => {
//       if (node.type === 'custom') {
//         const isStrikethrough = strikethroughNodes.has(node.id);

//         return {
//           ...node,

//           data: {
//             ...node.data,
//             isStrikethrough,
//             onClose: handleNodeClose,
//           },
//         };
//       }
//       return {
//         ...node,
//       };
//     });
//   }, [baseNodes, strikethroughNodes, handleNodeClose]);

//   // Standard React Flow handlers
//   const onNodesChange: OnNodesChange = useCallback(
//     (changes) => setBaseNodes((nds) => applyNodeChanges(changes, nds)),
//     []
//   );

//   const onEdgesChange: OnEdgesChange = useCallback(
//     (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
//     []
//   );

//   const onConnect: OnConnect = useCallback(
//     (params) => setEdges((es) => addEdge(params, es)),
//     []
//   );

//   const [rootModalOpen, setRootModalOpen] = useState(false);

//   const handleNodeClick = useCallback(
//     (event: MouseEvent, node: Node) => {
//       setCourseId(node.data.courseId);
//       setNodeName(node.id);

//       if (node.data.title === 'root') {
//         setRootModalOpen(true);
//       } else {
//         setTitle(node.data.title);
//         setDrawerOpen(true);
//       }
//     },
//     [setCourseId, setNodeName, setTitle, setDrawerOpen]
//   );

//   return {
//     nodes: optimizedNodes,
//     edges,
//     setNodes: setBaseNodes,
//     onNodesChange,
//     onEdgesChange,
//     onConnect,
//     handleNodeClick,
//     setDrawerOpen,
//     rootModalOpen,
//     setRootModalOpen,

//     // Debug/utility info
//     strikethroughCount: strikethroughNodes.size,
//     totalNodes: baseNodes.length,
//     strikethroughNodeIds: Array.from(strikethroughNodes),
//   };
// };

// export default useTreeFlow;

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
