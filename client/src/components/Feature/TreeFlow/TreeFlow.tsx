import '@xyflow/react/dist/style.css';
import DrawerComp from '@components/common/Drawer/DrawerComp';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';
import { Controls, Edge, MarkerType, ReactFlow, Node } from '@xyflow/react';
import { ProgressContext } from '@features/progress/ProgressContext';
import ProgressPanel from '@features/progress/ProgressPanel';
import CourseSearch from '@features/progress/CourseSearch';
import OpenCourseFromUrl from '@features/progress/OpenCourseFromUrl';
import { TreeFlowProvider, useTreeFlowContext } from '@context/TreeFlowContext';
import { ModalRoot } from '@components/common';
import CustomNode from '@components/layout/CustomNode/CustomNode';
import { memo, useMemo } from 'react';
import { initialNodes as initialNodesCPE } from '@components/layout/node/cpeNode/initialNodes';
import { initialEdges as initialEdgesCPE } from '@components/layout/edge/cpeEdge/initialEdges';
import { initialNodesEE } from '@components/layout/node/EENode/initialNodesEE';
import { initialEdgesEE } from '@components/layout/edge/EeEdge/initialEdgesEE';
import { useI18n } from '@i18n/context';
interface TreeFlowProps {
  flowType: 'cpe' | 'ee';
}
const TreeFlowInner = memo(
  ({
    initialNodes,
    initialEdges,
    flowType,
  }: {
    initialNodes: Node[];
    initialEdges: Edge[];
    flowType: 'cpe' | 'ee';
  }) => {
    const { title } = useTreeFlowContext();
    const { dir } = useI18n();
    const {
      nodes,
      edges,
      onNodesChange,
      onEdgesChange,
      onConnect,
      handleNodeClick,
      rootModalOpen,
      setRootModalOpen,
      progress,
      isSignedIn,
      highlight,
      setHighlight,
    } = useTreeFlow(initialNodes, initialEdges);

    const progressValue = useMemo(
      () => ({ progress, isSignedIn, highlight, setHighlight }),
      [progress, isSignedIn, highlight, setHighlight]
    );

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
      <ProgressContext.Provider value={progressValue}>
        <div className="w-full h-[calc(100dvh-6rem)] px-2 sm:px-6 md:px-10 overflow-hidden bg-transparent">
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
            nodesDraggable={false}
          >
            <CourseSearch />
            <OpenCourseFromUrl />
            <ProgressPanel />
            <Controls
              position={dir === 'rtl' ? 'bottom-left' : 'bottom-right'}
              showInteractive={false}
            />
          </ReactFlow>

          {rootModalOpen && (
            <ModalRoot
              isOpen={rootModalOpen}
              onClose={() => setRootModalOpen(false)}
              flowType={flowType}
            />
          )}
          {!rootModalOpen && title !== 'root' && <DrawerComp />}
        </div>
      </ProgressContext.Provider>
    );
  }
);

TreeFlowInner.displayName = 'TreeFlowInner';

export default function TreeFlow({ flowType }: TreeFlowProps) {
  const initialNodes = flowType === 'cpe' ? initialNodesCPE : initialNodesEE;
  const initialEdges = flowType === 'cpe' ? initialEdgesCPE : initialEdgesEE;
  return (
    <TreeFlowProvider>
      <TreeFlowInner
        initialNodes={initialNodes}
        initialEdges={initialEdges}
        flowType={flowType}
      />
    </TreeFlowProvider>
  );
}
