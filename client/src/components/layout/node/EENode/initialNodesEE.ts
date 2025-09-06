import { type Node } from '@xyflow/react';

import { RootStyle } from './NodeStyle';
import { EE } from './StaticNodeEEValue';

const EEMap = new Map(EE.map((item) => [item.id, item.value]));

export const initialNodesEE: Node[] = [
  {
    id: 'root',
    position: { x: -150, y: -400 },
    data: {
      label: EEMap.get('root'),
      title: 'root',
    },
    type: 'input',
    style: {
      width: 1500,
      ...RootStyle,
      fontSize: 30,
      padding: 15,
      borderRadius: 15,
    },
  },
];
