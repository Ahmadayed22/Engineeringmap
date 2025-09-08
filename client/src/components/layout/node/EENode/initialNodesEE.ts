import { type Node } from '@xyflow/react';

import {
  RootStyle,
  It_Sciences,
  computerStyle,
  ElectricityStyle,
} from './NodeStyle';
import { EE } from './StaticNodeEEValue';

const EEMap = new Map(EE.map((item) => [item.id, item.value]));

export const initialNodesEE: Node[] = [
  {
    id: 'root',
    position: { x: -350, y: -400 },
    data: {
      label: EEMap.get('root'),
      title: 'root',
    },
    type: 'input',
    style: {
      width: 1500,
      ...It_Sciences,
      fontSize: 30,
      padding: 15,
      borderRadius: 15,
    },
  },
  // first level
  {
    id: 'csRemedial',
    position: { x: -1450, y: -200 },
    type: 'custom',
    data: {
      label: `${EEMap.get('csRemedial')} `,
      courseId: 3,
      title: 'csRemedial',
    },
    style: It_Sciences,
  },
  {
    id: 'physics',
    position: { x: 290, y: -200 },
    type: 'custom',
    data: {
      label: `${EEMap.get('physics1')} `,
      courseId: 1,
      title: 'physics',
    },
    style: It_Sciences,
  },
  {
    id: 'calculus1',
    position: { x: 1950, y: -200 },
    type: 'custom',
    data: {
      label: `${EEMap.get('calculus1')} `,
      courseId: 6,
      title: 'calculus1',
    },
    style: It_Sciences,
  },
  //calculus1 path
  {
    id: 'calculus2',
    position: { x: 1950, y: -50 },
    type: 'custom',
    data: {
      label: `${EEMap.get('calculus2')} `,
      courseId: 7,
      title: 'calculus2',
    },
    style: It_Sciences,
  },
  {
    id: 'calculus3',
    position: { x: 1950, y: 100 },
    type: 'custom',
    data: {
      label: `${EEMap.get('calculus3')} `,
      courseId: 9,
      title: 'calculus3',
    },
    style: It_Sciences,
  },
  {
    id: 'engineeringMath1',
    position: { x: 1950, y: 250 },
    type: 'custom',
    data: {
      label: `${EEMap.get('engineeringMath1')} `,
      courseId: 9,
      title: 'engineeringMath1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsAndSystems',
    position: { x: 1950, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('signalsAndSystems')} `,
      courseId: 9,
      title: 'signalsAndSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'engineeringMath2',
    position: { x: 1950, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('engineeringMath2')} `,
      courseId: 9,
      title: 'engineeringMath2',
    },
    style: ElectricityStyle,
  },
  // engineeringMath2 path
  {
    id: 'numericalMethods',
    position: { x: 1950, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('numericalMethods')} `,
      courseId: 9,
      title: 'numericalMethods',
    },
    style: ElectricityStyle,
  },
  {
    id: 'engineeringEconomy',
    position: { x: 2200, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('engineeringEconomy')} `,
      courseId: 9,
      title: 'engineeringEconomy',
    },
    style: ElectricityStyle,
  },
  {
    id: 'physics2_',
    position: { x: 1650, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('physics2')} `,
      courseId: 9,
      title: 'physics2',
    },
    style: It_Sciences,
  },
  //numericalMethods path
  {
    id: 'controlSystems',
    position: { x: 1950, y: 850 },
    type: 'custom',
    data: {
      label: `${EEMap.get('controlSystems')} `,
      courseId: 9,
      title: 'controlSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'instrumentsAndControlLab',
    position: { x: 1950, y: 1000 },
    type: 'custom',
    data: {
      label: `${EEMap.get('instrumentsAndControlLab')} `,
      courseId: 9,
      title: 'instrumentsAndControlLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'selectedTopicsControl',
    position: { x: 2200, y: 1000 },
    type: 'custom',
    data: {
      label: `${EEMap.get('selectedTopicsControl')} `,
      courseId: 9,
      title: 'selectedTopicsControl',
    },
    style: ElectricityStyle,
  },
  // physics2_ path
  {
    id: 'electromagnetics1',
    position: { x: 1650, y: 850 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electromagnetics1')} `,
      courseId: 9,
      title: 'electromagnetics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electromagnetics2',
    position: { x: 1650, y: 1000 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electromagnetics2')} `,
      courseId: 9,
      title: 'electromagnetics2',
    },
    style: ElectricityStyle,
  },
  {
    id: 'communications1',
    position: { x: 1500, y: 1150 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communications1')} `,
      courseId: 9,
      title: 'communications1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'antennasWavePropagation',
    position: { x: 1800, y: 1150 },
    type: 'custom',
    data: {
      label: `${EEMap.get('antennasWavePropagation')} `,
      courseId: 9,
      title: 'antennasWavePropagation',
    },
    style: ElectricityStyle,
  },

  {
    id: 'communicationSystems',
    position: { x: 1500, y: 1300 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communicationSystems')} `,
      courseId: 9,
      title: 'communicationSystems',
    },
    style: ElectricityStyle,
  },
  //physics path
  {
    id: 'physicsLab1',
    position: { x: 450, y: -50 },
    type: 'custom',
    data: {
      label: `${EEMap.get('physics1')} `,
      courseId: 1,
      title: 'physics',
    },
    style: It_Sciences,
  },
  {
    id: 'physics2',
    position: { x: 150, y: -50 },
    type: 'custom',
    data: {
      label: `${EEMap.get('physics2')} `,
      courseId: 1,
      title: 'physics2',
    },
    style: It_Sciences,
  },
  {
    id: 'physicsLab2',
    position: { x: 300, y: 100 },
    type: 'custom',
    data: {
      label: `${EEMap.get('physicsLab2')} `,
      courseId: 1,
      title: 'physicsLab2',
    },
    style: It_Sciences,
  },
  {
    id: 'electricCircuits1',
    position: { x: 0, y: 100 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricCircuits1')} `,
      courseId: 1,
      title: 'electricCircuits1',
    },
    style: ElectricityStyle,
  },
  // electricCircuits1 path
  {
    id: 'electronics1',
    position: { x: 0, y: 250 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electronics1')} `,
      courseId: 1,
      title: 'electronics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsAndSystems_',
    position: { x: -1000, y: 250 },
    type: 'custom',
    data: {
      label: `${EEMap.get('signalsAndSystems')} `,
      courseId: 1,
      title: 'signalsAndSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuits2',
    position: { x: 1000, y: 250 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricCircuits2')} `,
      courseId: 1,
      title: 'electricCircuits2',
    },
    style: ElectricityStyle,
  },
  // electronics1 path
  {
    id: 'electronics2',
    position: { x: 0, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electronics2')} `,
      courseId: 1,
      title: 'electronics2',
    },
    style: ElectricityStyle,
  },
  {
    id: 'engineeringEthics',
    position: { x: -250, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('engineeringEthics')} `,
      courseId: 1,
      title: 'engineeringEthics',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electronicsLab',
    position: { x: 250, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electronicsLab')} `,
      courseId: 1,
      title: 'electronicsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'digitalElectronics',
    position: { x: 0, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('digitalElectronics')} `,
      courseId: 1,
      title: 'digitalElectronics',
    },
    style: ElectricityStyle,
  },
  // digitalElectronics path
  {
    id: 'integratedCircuits',
    position: { x: 0, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('integratedCircuits')} `,
      courseId: 1,
      title: 'integratedCircuits',
    },
    style: ElectricityStyle,
  },

  {
    id: 'advancedElectronicsLab',
    position: { x: 250, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('advancedElectronicsLab')} `,
      courseId: 1,
      title: 'advancedElectronicsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'biomedicalElectronics',
    position: { x: -250, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('biomedicalElectronics')} `,
      courseId: 1,
      title: 'biomedicalElectronics',
    },
    style: ElectricityStyle,
  },
];
