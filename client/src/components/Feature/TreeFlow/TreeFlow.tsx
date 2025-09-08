import '@xyflow/react/dist/style.css';
import DrawerComp from '@components/common/Drawer/DrawerComp';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';
import { Edge, MarkerType, ReactFlow, Node } from '@xyflow/react';
import { TreeFlowProvider, useTreeFlowContext } from '@context/TreeFlowContext';
import { ModalRoot } from '@components/common';
import CustomNode from '@components/layout/CustomNode/CustomNode';
import { memo, useMemo } from 'react';
import { initialNodes as initialNodesCPE } from '@components/layout/node/cpeNode/initialNodes';
import { initialEdges as initialEdgesCPE } from '@components/layout/edge/cpeEdge/initialEdges';
import { initialNodesEE } from '@components/layout/node/EENode/initialNodesEE';
import { initialEdgesEE } from '@components/layout/edge/EeEdge/initialEdgesEE';
interface TreeFlowProps {
  flowType: 'cpe' | 'ee';
}
const TreeFlowInner = memo(
  ({
    initialNodes,
    initialEdges,
  }: {
    initialNodes: Node[];
    initialEdges: Edge[];
  }) => {
    const { title } = useTreeFlowContext();
    const {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      handleNodeClick,

      rootModalOpen,
      setRootModalOpen,
    } = useTreeFlow(initialNodes, initialEdges);

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
      <div className="w-full h-screen px-2 sm:px-6 md:px-10 overflow-hidden bg-transparent ">
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
          nodeTypes={nodeTypes}
          // nodesDraggable={false}
        />

        {rootModalOpen && (
          <ModalRoot
            isOpen={rootModalOpen}
            onClose={() => setRootModalOpen(false)}
          />
        )}
        {!rootModalOpen && title !== 'root' && <DrawerComp />}
      </div>
    );
  }
);

TreeFlowInner.displayName = 'TreeFlowInner';

export default function TreeFlow({ flowType }: TreeFlowProps) {
  const initialNodes = flowType === 'cpe' ? initialNodesCPE : initialNodesEE;
  const initialEdges = flowType === 'cpe' ? initialEdgesCPE : initialEdgesEE;
  return (
    <TreeFlowProvider>
      <TreeFlowInner initialNodes={initialNodes} initialEdges={initialEdges} />
    </TreeFlowProvider>
  );
}
