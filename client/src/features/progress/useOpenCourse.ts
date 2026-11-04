import { useCallback } from 'react';
import { useReactFlow } from '@xyflow/react';
import { useTreeFlowContext } from '@context/TreeFlowContext';
import { useProgressContext } from './ProgressContext';

/** Centers the map on a course and opens its drawer. Must be used inside <ReactFlow>. */
export function useOpenCourse() {
  const ctx = useProgressContext();
  const { setCenter, getNode } = useReactFlow();
  const { setCourseId, setNodeName, setTitle, setDrawerOpen } =
    useTreeFlowContext();

  return useCallback(
    (courseId: number) => {
      const course = ctx?.progress.graph.courses.get(courseId);
      if (!course) return;
      const node = getNode(course.nodeId);
      if (node) {
        const w = node.measured?.width ?? 225;
        const h = node.measured?.height ?? 60;
        setCenter(node.position.x + w / 2, node.position.y + h / 2, {
          zoom: 1.1,
          duration: 600,
        });
      }
      setCourseId(courseId);
      setNodeName(course.nodeId);
      setTitle(course.name);
      setDrawerOpen(true);
    },
    [ctx, getNode, setCenter, setCourseId, setNodeName, setTitle, setDrawerOpen]
  );
}
