import '@xyflow/react/dist/style.css';
import { DrawerComp } from '@components/common/Drawer/DrawerComp';
// import ParticlesBackground from '@components/common/Background/ParticlesBackground';
//import FireParticles from '@components/common/Background/FireParticles';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';
import { MarkerType, ReactFlow } from '@xyflow/react';

export default function TreeFlow() {
  const {
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
  } = useTreeFlow();

  return (
    <div className="w-full h-screen px-2 sm:px-6 md:px-10 overflow-auto bg-transparent">
      {/* <ParticlesBackground className="fixed inset-0 -z-10" /> */}
      {/* <FireParticles /> */}
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
        title={title}
        nodeName={nodeName}
        courseId={courseId}
      />
    </div>
  );
}
