import '@xyflow/react/dist/style.css';
import { useMemo } from 'react';
import { MarkerType, ReactFlow } from '@xyflow/react';
import CustomNode from '@components/layout/CustomNode/CustomNode';
import type { PlanInfo } from './plans';
import { computeCourseStates } from './prerequisites';

const nodeTypes = { custom: CustomNode };
const edgeOptions = { markerEnd: { type: MarkerType.ArrowClosed } };

/** A study-plan map with completed courses struck through. No editing, no drawer. */
const ReadOnlyPlanMap = ({
  plan,
  completed,
}: {
  plan: PlanInfo;
  completed: ReadonlySet<number>;
}) => {
  const nodes = useMemo(() => {
    const states = computeCourseStates(plan.graph, completed);
    return plan.nodes.map((n) => {
      const id = Number(n.data?.courseId);
      const state = Number.isFinite(id) ? states.get(id) : undefined;
      return state
        ? {
            ...n,
            className: `status-${state.status}`,
            data: {
              ...n.data,
              isStrikethrough: state.status === 'completed',
              status: state.status,
            },
          }
        : n;
    });
  }, [plan, completed]);

  return (
    <div className="readonly-map h-[70vh] w-full overflow-hidden rounded-2xl border border-white/10">
      <ReactFlow
        nodes={nodes}
        edges={plan.edges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={edgeOptions}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        minZoom={0.2}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={{ hideAttribution: true }}
        style={{ background: 'transparent' }}
      />
    </div>
  );
};

export default ReadOnlyPlanMap;
