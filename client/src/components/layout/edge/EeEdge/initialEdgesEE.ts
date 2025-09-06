import { type Edge } from '@xyflow/react';

import { SciencesStyle, ItStyle } from './EdgeColor';
const initialEdgesEE: Edge[] = [
  {
    id: 'r-physics',
    source: 'root',
    target: 'physics',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  {
    id: 'r-Discrete Mathematics',
    source: 'root',
    target: 'Discrete Mathematics',
    type: 'smoothstep',
    style: ItStyle,
  },
  {
    id: 'r-csBasics',
    source: 'root',
    target: 'csBasics',
    type: 'smoothstep',
    style: ItStyle,
  },
  {
    id: 'r-statistics',
    source: 'root',
    target: 'statistics',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  {
    id: 'r-chemistry',
    source: 'root',
    target: 'chemistry',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  {
    id: 'r-calculus1',
    source: 'root',
    target: 'calculus1',
    type: 'smoothstep',
    style: SciencesStyle,
  },
];

export { initialEdgesEE };
