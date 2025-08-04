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

const useTreeFlow = () => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

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

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [title, setTitle] = useState<string | unknown>('');
  const [nodeName, setNodeName] = useState<string | null>('');
  const [courseId, setCourseId] = useState<number | unknown | null>(null);

  const handleNodeClick = useCallback((event: MouseEvent, node: Node) => {
    setCourseId(node.data.courseId);
    setNodeName(node.id);
    setTitle(node.data.title);
    setDrawerOpen(true);
  }, []);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    drawerOpen,
    title,
    handleNodeClick,
    setDrawerOpen,
    nodeName,
    courseId,
  };
};

export default useTreeFlow;
