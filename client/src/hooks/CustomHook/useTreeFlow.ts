import { useCallback, useState } from 'react';
import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type Node,
  type Edge,
} from '@xyflow/react';
import type { MouseEvent } from 'react';
import { useTreeFlowContext } from '@context/TreeFlowContext';

const useTreeFlow = () => {
  // const [nodes, setNodes] = useState<Node[]>(() =>
  //   initialNodes.map((node) => {
  //     // Only add onClose to custom nodes (e.g., skip 'root')
  //     if (node.type === 'custom') {
  //       return {
  //         ...node,
  //         data: {
  //           ...node.data,
  //           onClose: (id: string) => {
  //             console.log('Toggling close state for node with id:', id);
  //             // Toggle isClosing state
  //             setNodes((nds) =>
  //               nds.map((n) =>
  //                 n.id === id
  //                   ? {
  //                       ...n,
  //                       data: { ...n.data, isClosing: !n.data.isClosing },
  //                     }
  //                   : n
  //               )
  //             );
  //           },
  //         },
  //       };
  //     }
  //     return node;
  //   })
  // );
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
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
    nodes,
    edges,
    setNodes,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    setDrawerOpen,
    rootModalOpen,
    setRootModalOpen,
  };
};

export default useTreeFlow;

// import { useCallback, useState } from 'react';
// import { initialNodes } from '@components/layout/node/initialNodes';
// import { initialEdges } from '@components/layout/edge/initialEdges';
// import {
//   applyNodeChanges,
//   applyEdgeChanges,
//   addEdge,
//   type OnConnect,
//   type OnNodesChange,
//   type OnEdgesChange,
//   type Node,
//   type Edge,
// } from '@xyflow/react';
// import type { MouseEvent } from 'react';
// import { useTreeFlowContext } from '@context/TreeFlowContext';

// const useTreeFlow = () => {
//   const [nodes, setNodes] = useState<Node[]>(() =>
//     initialNodes.map((node) => {
//       if (node.type === 'custom') {
//         return {
//           ...node,
//           data: {
//             ...node.data,
//             isClosing: false, // Ensure initial state
//             onClose: (id: string) => {
//               setNodes((nds) =>
//                 nds.map((n) =>
//                   n.id === id
//                     ? {
//                         ...n,
//                         data: { ...n.data, isClosing: !n.data.isClosing },
//                       }
//                     : n
//                 )
//               );
//             },
//           },
//         };
//       }
//       return node;
//     })
//   );

//   const [edges, setEdges] = useState<Edge[]>(initialEdges);
//   const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
//     useTreeFlowContext();

//   const onNodesChange: OnNodesChange = useCallback((changes) => {
//     setNodes((nds) => {
//       const updatedNodes = applyNodeChanges(changes, nds);
//       return updatedNodes.map((node) => ({ ...node })); // Ensure immutability
//     });
//   }, []);

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
//     nodes,
//     edges,
//     setNodes,
//     onNodesChange,
//     onEdgesChange,
//     onConnect,
//     handleNodeClick,
//     setDrawerOpen,
//     rootModalOpen,
//     setRootModalOpen,
//   };
// };

// export default useTreeFlow;
