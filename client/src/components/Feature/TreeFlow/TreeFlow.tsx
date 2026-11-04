import '@xyflow/react/dist/style.css';
import DrawerComp from '@components/common/Drawer/DrawerComp';
import useTreeFlow from '@hooks/CustomHook/useTreeFlow';
import {
  Controls,
  Edge,
  MarkerType,
  Panel,
  ReactFlow,
  Node,
} from '@xyflow/react';
import { ProgressContext } from '@features/progress/ProgressContext';
import ProgressPanel from '@features/progress/ProgressPanel';
import CourseSearch from '@features/progress/CourseSearch';
import OpenCourseFromUrl from '@features/progress/OpenCourseFromUrl';
import { TreeFlowProvider, useTreeFlowContext } from '@context/TreeFlowContext';
import { ModalRoot } from '@components/common';
import CustomNode from '@components/layout/CustomNode/CustomNode';
import { lazy, memo, Suspense, useMemo, useState } from 'react';
import { PageLoader } from '@components/feedbaks';
import { usePlan } from '@features/progress/plans';
import { useAuth } from '@hooks/CustomHook/useAuth';
import { useI18n } from '@i18n/context';

// Admin-only, so students never download the editor.
const MapEditor = lazy(() => import('@features/map/editor/MapEditor'));
interface TreeFlowProps {
  flowType: 'cpe' | 'ee';
}
const TreeFlowInner = memo(
  ({
    initialNodes,
    initialEdges,
    flowType,
    onEdit,
  }: {
    initialNodes: Node[];
    initialEdges: Edge[];
    flowType: 'cpe' | 'ee';
    /** Set for admins: opens the map editor. */
    onEdit?: () => void;
  }) => {
    const { title } = useTreeFlowContext();
    const { dir, t } = useI18n();
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
            {onEdit && (
              <Panel position="top-center">
                <button
                  onClick={onEdit}
                  className="cursor-pointer rounded-lg border border-white/20 bg-neutral-900/90 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-neutral-800"
                >
                  {t('mapEditor.open')}
                </button>
              </Panel>
            )}
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
  const { plan, isError, refetch } = usePlan(flowType);
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState(false);
  const { t } = useI18n();

  if (!plan) {
    return isError ? (
      <div className="flex flex-col items-center gap-3 py-16 text-white/80">
        <p>{t('map.loadFailed')}</p>
        <button
          onClick={() => void refetch()}
          className="cursor-pointer rounded-lg bg-white px-4 py-2 text-sm font-semibold text-neutral-900"
        >
          {t('common.tryAgain')}
        </button>
      </div>
    ) : (
      <PageLoader message={t('map.loading')} />
    );
  }

  if (editing && isAdmin) {
    return (
      <Suspense fallback={<PageLoader message={t('map.loading')} />}>
        <MapEditor plan={plan} onExit={() => setEditing(false)} />
      </Suspense>
    );
  }

  return (
    <TreeFlowProvider>
      {/* Keyed by version so a newly published map replaces the old one cleanly. */}
      <TreeFlowInner
        key={plan.version}
        initialNodes={plan.nodes}
        initialEdges={plan.edges}
        flowType={flowType}
        onEdit={isAdmin ? () => setEditing(true) : undefined}
      />
    </TreeFlowProvider>
  );
}
