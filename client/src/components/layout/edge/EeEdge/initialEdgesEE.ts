import { type Edge } from '@xyflow/react';

import { It_Sciences, computerStyle, ElectricityStyle } from './EdgeColor';

const initialEdgesEE: Edge[] = [
  {
    id: 'r-csRemedial',
    source: 'root',
    target: 'csRemedial',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'r-physics',
    source: 'root',
    target: 'physics',
    type: 'smoothstep',
    style: It_Sciences,
  },

  {
    id: 'r-calculus1',
    source: 'root',
    target: 'calculus1',
    type: 'smoothstep',
    style: It_Sciences,
  },
  //calculus1 pointer
  {
    id: 'calculus1-calculus2',
    source: 'calculus1',
    target: 'calculus2',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'calculus2-calculus3',
    source: 'calculus2',
    target: 'calculus3',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'calculus3-engineeringMath1',
    source: 'calculus3',
    target: 'engineeringMath1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'engineeringMath1-signalsAndSystems',
    source: 'engineeringMath1',
    target: 'signalsAndSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'signalsAndSystems-engineeringMath2',
    source: 'signalsAndSystems',
    target: 'engineeringMath2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },

  // engineeringMath2 pointer
  {
    id: 'engineeringMath2-numericalMethods',
    source: 'engineeringMath2',
    target: 'numericalMethods',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'engineeringMath2-physics2_',
    source: 'engineeringMath2',
    target: 'physics2_',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'engineeringMath2-engineeringEconomy',
    source: 'engineeringMath2',
    target: 'engineeringEconomy',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  //numericalMethods  path
  {
    id: 'numericalMethods-controlSystems',
    source: 'numericalMethods',
    target: 'controlSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'controlSystems-instrumentsAndControlLab',
    source: 'controlSystems',
    target: 'instrumentsAndControlLab',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'controlSystems-selectedTopicsControl',
    source: 'controlSystems',
    target: 'selectedTopicsControl',
    type: 'smoothstep',
    style: ElectricityStyle,
  },

  // physics2_ path
  {
    id: 'physics2_-electromagnetics1',
    source: 'physics2_',
    target: 'electromagnetics1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electromagnetics1-electromagnetics2',
    source: 'electromagnetics1',
    target: 'electromagnetics2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electromagnetics2-communications1',
    source: 'electromagnetics2',
    target: 'communications1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electromagnetics2-antennasWavePropagation',
    source: 'electromagnetics2',
    target: 'antennasWavePropagation',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'communications1-communicationSystems',
    source: 'communications1',
    target: 'communicationSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  //physics path
  {
    id: 'physics-physicsLab1',
    source: 'physics',
    target: 'physicsLab1',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'physics-physics2',
    source: 'physics',
    target: 'physics2',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'physics2-physicsLab2',
    source: 'physics2',
    target: 'physicsLab2',
    type: 'smoothstep',
    style: It_Sciences,
  },
  {
    id: 'physics2-electricCircuits1',
    source: 'physics2',
    target: 'electricCircuits1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  // electricCircuits1 path

  {
    id: 'electricCircuits1-electronics1',
    source: 'electricCircuits1',
    target: 'electronics1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuits1-electricCircuits2',
    source: 'electricCircuits1',
    target: 'electricCircuits2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuits1-signalsAndSystems_',
    source: 'electricCircuits1',
    target: 'signalsAndSystems_',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  // electronics1 path
  {
    id: 'electronics1-electronics2',
    source: 'electronics1',
    target: 'electronics2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electronics2-engineeringEthics',
    source: 'electronics2',
    target: 'engineeringEthics',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electronics2-electronicsLab',
    source: 'electronics2',
    target: 'electronicsLab',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electronics2-digitalElectronics',
    source: 'electronics2',
    target: 'digitalElectronics',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  // digitalElectronics path

  {
    id: 'digitalElectronics-integratedCircuits',
    source: 'digitalElectronics',
    target: 'integratedCircuits',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'digitalElectronics-advancedElectronicsLab',
    source: 'digitalElectronics',
    target: 'advancedElectronicsLab',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'digitalElectronics-biomedicalElectronics',
    source: 'digitalElectronics',
    target: 'biomedicalElectronics',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
];

export { initialEdgesEE };
