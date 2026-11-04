import { Navigate, useParams } from 'react-router-dom';
import { PageLoader } from '@components/feedbaks';
import { PLAN_META, usePlans } from '@features/progress/plans';
import { useI18n } from '../../i18n/context';

/** /course/:id → opens that course on whichever study plan contains it. */
const CourseRedirect = () => {
  const { id } = useParams();
  const { t } = useI18n();
  const { plans, isError } = usePlans();

  if (!plans) {
    return isError ? (
      <Navigate to="/" replace />
    ) : (
      <PageLoader message={t('loader.course')} />
    );
  }

  const courseId = Number(id);
  const key = plans.cpe.graph.courses.has(courseId)
    ? 'cpe'
    : plans.ee.graph.courses.has(courseId)
      ? 'ee'
      : null;
  return (
    <Navigate
      to={key ? `${PLAN_META[key].path}?course=${courseId}` : '/'}
      replace
    />
  );
};

export default CourseRedirect;
