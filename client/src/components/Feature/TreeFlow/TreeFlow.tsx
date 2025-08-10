import '@xyflow/react/dist/style.css';
import { DrawerComp } from '@components/common/Drawer/DrawerComp';
// import ParticlesBackground from '@components/common/Background/ParticlesBackground';
//import FireParticles from '@components/common/Background/FireParticles';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';
import { MarkerType, ReactFlow } from '@xyflow/react';
import { TreeFlowProvider, useTreeFlowContext } from '@context/TreeFlowContext';
import { ModalRoot } from '@components/common';
import CustomNode from '@components/layout/node/CustomNode';
import { memo, useMemo } from 'react';
// import CustomNode from '@components/layout/node/CustomNode';

const TreeFlowInner = memo(() => {
  const { courseId, drawerOpen, title, nodeName } = useTreeFlowContext();
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    setDrawerOpen,
    rootModalOpen,
    setRootModalOpen,
  } = useTreeFlow();

  // Memoize nodeTypes to prevent recreation
  const nodeTypes = useMemo(
    () => ({
      custom: CustomNode,
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      markerEnd: { type: MarkerType.ArrowClosed },
    }),
    []
  );

  return (
    <div className="w-full h-screen px-2 sm:px-6 md:px-10 overflow-auto bg-transparent">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        defaultEdgeOptions={defaultEdgeOptions}
        minZoom={0.3}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        style={{ background: 'transparent' }}
        proOptions={{ hideAttribution: true }}
        nodeTypes={nodeTypes} // Use memoized nodeTypes
        nodesDraggable={false}
      ></ReactFlow>

      {rootModalOpen && (
        <ModalRoot
          isOpen={rootModalOpen}
          onClose={() => setRootModalOpen(false)}
        />
      )}
      {!rootModalOpen && title !== 'root' && (
        <DrawerComp
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title={title}
          nodeName={nodeName}
          courseId={courseId}
        />
      )}
    </div>
  );
});

TreeFlowInner.displayName = 'TreeFlowInner';
export default function TreeFlow() {
  return (
    <TreeFlowProvider>
      <TreeFlowInner />
    </TreeFlowProvider>
  );
}
