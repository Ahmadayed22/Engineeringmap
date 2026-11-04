import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNodesInitialized } from '@xyflow/react';
import { useOpenCourse } from './useOpenCourse';

/**
 * Handles links like /computerEngineer?course=23 (used by notifications).
 * The drawer opens right away; the map centers on the course once React Flow has
 * measured its nodes (that can lag on slow devices, and centering needs sizes).
 */
const OpenCourseFromUrl = () => {
  const [params, setParams] = useSearchParams();
  const ready = useNodesInitialized();
  const openCourse = useOpenCourse();
  const pending = useRef<number | null>(null);
  const course = params.get('course');

  useEffect(() => {
    if (!course) return;
    const id = Number(course);
    if (!Number.isFinite(id)) return;
    openCourse(id);
    pending.current = id;
    const next = new URLSearchParams(params);
    next.delete('course');
    setParams(next, { replace: true });
  }, [course, openCourse, params, setParams]);

  useEffect(() => {
    if (ready && pending.current !== null) {
      openCourse(pending.current);
      pending.current = null;
    }
  }, [ready, openCourse]);

  return null;
};

export default OpenCourseFromUrl;
