import { useCallback, useState } from 'react';
// import '../../layout/node/NodeStyle.css';
import {
  ReactFlow,
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
  MarkerType,
  // MiniMap,
} from '@xyflow/react';
import type { MouseEvent } from 'react';

import '@xyflow/react/dist/style.css';
import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';
import { DrawerComp } from '@components/common/Drawer/DrawerComp';
import ParticlesBackground from '@components/common/Background/ParticlesBackground';
// import { ProgressNode } from '@components/common';

export default function TreeFlow() {
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
  const [node, setTitle] = useState<Node | null>(null);
  const handleNodeClick = useCallback((event: MouseEvent, node: Node) => {
    setTitle(node);
    setDrawerOpen(true);
  }, []);

  return (
    <div className="w-full h-screen px-2 sm:px-6 md:px-10 overflow-auto bg-transparent">
      <ParticlesBackground className="fixed inset-0 -z-10" />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        minZoom={0.3}
        fitView
        fitViewOptions={{
          padding: 0.2,
        }}
        style={{
          background: 'transparent',
        }}
      >
        {/* <Background /> */}
        {/* <MiniMap nodeStrokeWidth={3} zoomable pannable /> */}
      </ReactFlow>

      <DrawerComp
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        node={node}
      />
    </div>
  );
}
