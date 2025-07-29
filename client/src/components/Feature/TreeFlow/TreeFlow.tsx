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
  Background,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import { initialNodes } from '@components/layout/node/initialNodes';
import { initialEdges } from '@components/layout/edge/initialEdges';
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
  return (
    <div className="w-[100vh] md:w-[200vh] h-[100vh] ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultEdgeOptions={{
          markerEnd: { type: MarkerType.ArrowClosed },
        }}
        defaultViewport={{ x: 500, y: 100, zoom: 0.5 }}
        minZoom={0.4}
        // maxZoom={4}
        // fitView={true}
        // fitViewOptions={{
        //   padding: 0.2,
        //   includeHiddenNodes: false,
        //   minZoom: 0.5,
        //   maxZoom: 2,
        // }}
        // nodeTypes={nodeTypes}
        // proOptions={{ hideAttribution: true }}
        // draggable={true}
      >
        {/* <MiniMap nodeStrokeWidth={9} /> */}
        <Background />
        {/* <Controls /> */}
      </ReactFlow>
    </div>
  );
}
