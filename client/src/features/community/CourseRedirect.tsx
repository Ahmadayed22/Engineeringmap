import { useMemo } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { PageLoader } from '@components/feedbaks';
import { usePlanMaps } from '@features/progress/plans';
import { roadmapPath, useRoadmaps } from '@features/map/useRoadmaps';
import { useI18n } from '../../i18n/context';

/** /course/:id → opens that course on the first roadmap (in display order) that contains it. */
const CourseRedirect = () => {
  const { id } = useParams();
  const { t } = useI18n();
  const { roadmaps } = useRoadmaps();
  const keys = useMemo(() => roadmaps.map((r) => r.slug), [roadmaps]);
  const { plans, isError } = usePlanMaps(keys);

  if (!plans) {
    return isError ? (
      <Navigate to="/" replace />
    ) : (
      <PageLoader message={t('loader.course')} />
    );
  }

  const courseId = Number(id);
  const key = keys.find((k) => plans[k].graph.courses.has(courseId));
  return (
    <Navigate
      to={key ? `${roadmapPath(key)}?course=${courseId}` : '/'}
      replace
    />
  );
};

export default CourseRedirect;
