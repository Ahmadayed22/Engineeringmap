import { useCallback, useState } from 'react';

import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';
import {
  //   ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  //   Background,
  //   Controls,
  //   MiniMap,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  //   type OnNodeDrag,
  type Node,
  type Edge,
  //   MarkerType,
  // MiniMap,
} from '@xyflow/react';
import type { MouseEvent } from 'react';
import { useTreeFlowContext } from '@context/TreeFlowContext';

const useTreeFlow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();
  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((es) => applyEdgeChanges(changes, es)),
    []
  );
  const onConnect: OnConnect = useCallback(
    (params) => setEdges((es) => addEdge(params, es)),
    []
  );
  //   const nodeTypes = {
  //     progress: ProgressNode,
  //   };

  // const [drawerOpen, setDrawerOpen] = useState(false);
  // const [title, setTitle] = useState<string | unknown>('');
  // const [nodeName, setNodeName] = useState<string | null>('');
  // const [courseId, setCourseId] = useState<number | unknown | null>(null);
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
    onNodesChange,
    onEdgesChange,
    onConnect,
    // drawerOpen,
    // title,
    handleNodeClick,
    setDrawerOpen,
    // nodeName,
    // courseId,
    rootModalOpen,
    setRootModalOpen,
  };
};

export default useTreeFlow;
