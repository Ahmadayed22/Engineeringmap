import { createContext, useContext } from 'react';
import type { CourseProgress } from './useCourseProgress';

type ProgressContextValue = {
  progress: CourseProgress;
  isSignedIn: boolean;
  highlight: boolean;
  setHighlight: (on: boolean) => void;
};

export const ProgressContext = createContext<ProgressContextValue | null>(null);

/** Null outside a study-plan map (e.g. when the drawer is reused elsewhere). */
export const useProgressContext = () => useContext(ProgressContext);
