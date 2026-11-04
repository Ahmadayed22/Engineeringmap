import { useParams } from 'react-router-dom';
import { TreeFlow } from '@components/Feature';

/** /plan/:slug: any roadmap's map (CPE and EE also keep their original addresses). */
const PlanFlow = () => {
  const { slug = '' } = useParams();
  // Keyed so switching roadmaps starts a fresh map, editor and drawer.
  return <TreeFlow key={slug} flowType={slug} />;
};

export default PlanFlow;
