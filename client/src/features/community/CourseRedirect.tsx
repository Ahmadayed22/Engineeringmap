import { useEffect, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageLoader } from '@components/feedbaks';
import { useI18n } from '../../i18n/context';

/**
 * /course/:id → opens that course on whichever study plan contains it.
 * The plan data is loaded lazily so the header doesn't pull the maps into every page.
 */
const CourseRedirect = () => {
  const { id } = useParams();
  const [target, setTarget] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const courseId = Number(id);
    let cancelled = false;
    Promise.all([
      import('@components/layout/node/cpeNode/initialNodes'),
      import('@components/layout/node/EENode/initialNodesEE'),
    ]).then(([cpe, ee]) => {
      if (cancelled) return;
      const has = (nodes: { data?: { courseId?: unknown } }[]) =>
        nodes.some((n) => Number(n.data?.courseId) === courseId);
      const path = has(cpe.initialNodes)
        ? '/computerEngineer'
        : has(ee.initialNodesEE)
          ? '/electricalEngineer'
          : null;
      setTarget(path ? `${path}?course=${courseId}` : '/');
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return target ? (
    <Navigate to={target} replace />
  ) : (
    <PageLoader message={t('loader.course')} />
  );
};

export default CourseRedirect;
