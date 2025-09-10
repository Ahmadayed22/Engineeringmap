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
    position: { x: -1600, y: -200 },
    type: 'custom',
    data: {
      label: `${EEMap.get('csRemedial')} `,
      courseId: 111,
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
      courseId: 63,
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
      courseId: 94,
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
      courseId: 64,
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
      courseId: 66,
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
      courseId: 61,
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
      courseId: 13,
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
      courseId: 108,
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
      courseId: 110,
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
      courseId: 109,
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
      courseId: 71,
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
      courseId: 72,
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
      courseId: 95,
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
      courseId: 106,
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
      courseId: 105,
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
      label: `${EEMap.get('physicsLab1')} `,
      courseId: 12,
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
      courseId: 13,
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
      courseId: 15,
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
      courseId: 68,
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
      courseId: 73,
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
      courseId: 94,
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
      courseId: 69,
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
      courseId: 74,
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
      courseId: 67,
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
      courseId: 75,
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
      courseId: 77,
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
      courseId: 78,
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
      courseId: 76,
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
      courseId: 79,
      title: 'biomedicalElectronics',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsAndSystems__',
    position: { x: -550, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('signalsAndSystems')} `,
      courseId: 94,
      title: 'signalsAndSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'powerElectronics',
    position: { x: -550, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerElectronics')} `,
      courseId: 80,
      title: 'powerElectronics',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricDrives',
    position: { x: -550, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricDrives')} `,
      courseId: 84,
      title: 'electricDrives',
    },
    style: ElectricityStyle,
  },
  // signalsAndSystems path
  {
    id: 'engineeringProbability',
    position: { x: -1000, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('engineeringProbability')} `,
      courseId: 62,
      title: 'engineeringProbability',
    },
    style: ElectricityStyle,
  },
  {
    id: 'communications1_',
    position: { x: -1000, y: 550 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communications1')} `,
      courseId: 95,
      title: 'communications1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'digitalElectronics_',
    position: { x: -850, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('digitalElectronics')} `,
      courseId: 77,
      title: 'digitalElectronics',
    },
    style: ElectricityStyle,
  },

  {
    id: 'communications2',
    position: { x: -1125, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communications2')} `,
      courseId: 96,
      title: 'communications2',
    },
    style: ElectricityStyle,
  },
  {
    id: 'communicationNetworks',
    position: { x: -1400, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communicationNetworks')} `,
      courseId: 98,
      title: 'communicationNetworks',
    },
    style: ElectricityStyle,
  },
  {
    id: 'digitalSignalProcessing',
    position: { x: -1650, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('digitalSignalProcessing')} `,
      courseId: 99,
      title: 'digitalSignalProcessing',
    },
    style: ElectricityStyle,
  },
  {
    id: 'opticalCommunications',
    position: { x: -1900, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('opticalCommunications')} `,
      courseId: 100,
      title: 'opticalCommunications',
    },
    style: ElectricityStyle,
  },
  {
    id: 'selectedTopicsControl_',
    position: { x: -2175, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('selectedTopicsControl')} `,
      courseId: 109,
      title: 'selectedTopicsControl',
    },
    style: ElectricityStyle,
  },
  //communications2 path

  {
    id: 'mobileCommunications',
    position: { x: -1125, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('mobileCommunications')} `,
      courseId: 102,
      title: 'mobileCommunications',
    },
    style: ElectricityStyle,
  },
  {
    id: 'communicationsLab',
    position: { x: -850, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('communicationsLab')} `,
      courseId: 103,
      title: 'communicationsLab',
    },
    style: ElectricityStyle,
  },

  {
    id: 'multimediaStreaming',
    position: { x: -1400, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('multimediaStreaming')} `,
      courseId: 107,
      title: 'multimediaStreaming',
    },
    style: ElectricityStyle,
  },
  {
    id: 'advancedCommunicationsLab',
    position: { x: -1650, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('advancedCommunicationsLab')} `,
      courseId: 104,
      title: 'advancedCommunicationsLab',
    },
    style: ElectricityStyle,
  },

  //electricCircuits2 path
  {
    id: 'electricCircuitsLab',
    position: { x: 1150, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricCircuitsLab')} `,
      courseId: 70,
      title: 'electricCircuitsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricalMachines1',
    position: { x: 850, y: 400 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricalMachines1')} `,
      courseId: 81,
      title: 'electricalMachines1',
    },
    style: ElectricityStyle,
  },
  //electricalMachines1 path
  {
    id: 'electricalMachines2',
    position: { x: 1000, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricalMachines2')} `,
      courseId: 82,
      title: 'electricalMachines2',
    },
    style: ElectricityStyle,
  },
  {
    id: 'powerSystemAnalysis',
    position: { x: 700, y: 700 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerSystemAnalysis')} `,
      courseId: 85,
      title: 'powerSystemAnalysis',
    },
    style: ElectricityStyle,
  },

  {
    id: 'electricalMachinesLab',
    position: { x: 1200, y: 825 },
    type: 'custom',
    data: {
      label: `${EEMap.get('electricalMachinesLab')} `,
      courseId: 83,
      title: 'electricalMachinesLab',
    },
    style: ElectricityStyle,
  },
  //powerSystemAnalysis path

  {
    id: 'powerSystemProtection',
    position: { x: 1000, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerSystemProtection')} `,
      courseId: 86,
      title: 'powerSystemProtection',
    },
    style: ElectricityStyle,
  },
  {
    id: 'selectedTopicsPower',
    position: { x: 668, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('selectedTopicsPower')} `,
      courseId: 87,
      title: 'selectedTopicsPower',
    },
    style: ElectricityStyle,
  },
  {
    id: 'highVoltageEngineering',
    position: { x: 425, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('highVoltageEngineering')} `,
      courseId: 88,
      title: 'highVoltageEngineering',
    },
    style: ElectricityStyle,
  },
  {
    id: 'powerSystemOperations',
    position: { x: 150, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerSystemOperations')} `,
      courseId: 89,
      title: 'powerSystemOperations',
    },
    style: ElectricityStyle,
  },
  {
    id: 'powerSystemPlanning',
    position: { x: -100, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerSystemPlanning')} `,
      courseId: 90,
      title: 'powerSystemPlanning',
    },
    style: ElectricityStyle,
  },
  {
    id: 'renewableEnergyAndQuality',
    position: { x: -450, y: 900 },
    type: 'custom',
    data: {
      label: `${EEMap.get('renewableEnergyAndQuality')} `,
      courseId: 91,
      title: 'renewableEnergyAndQuality',
    },
    style: ElectricityStyle,
  },

  //powerSystemProtection path
  {
    id: 'powerLab',
    position: { x: 1000, y: 1050 },
    type: 'custom',
    data: {
      label: `${EEMap.get('powerLab')} `,
      courseId: 92,
      title: 'powerLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'advancedPowerLab',
    position: { x: 700, y: 1050 },
    type: 'custom',
    data: {
      label: `${EEMap.get('advancedPowerLab')} `,
      courseId: 93,
      title: 'advancedPowerLab',
    },
    style: ElectricityStyle,
  },
  // csRemedial path
  {
    id: 'csSkills',
    position: { x: -1610, y: -75 },
    type: 'custom',
    data: {
      label: `${EEMap.get('csSkills')} `,
      courseId: 22,
      title: 'csSkills',
    },
    style: computerStyle,
  },
  {
    id: 'digitalLogic',
    position: { x: -1588, y: 75 },
    type: 'custom',
    data: {
      label: `${EEMap.get('digitalLogic')} `,
      courseId: 23,
      title: 'digitalLogic',
    },
    style: computerStyle,
  },
  {
    id: 'digitalLogicLab',
    position: { x: -1800, y: 225 },
    type: 'custom',
    data: {
      label: `${EEMap.get('digitalLogicLab')} `,
      courseId: 40,
      title: 'digitalLogicLab',
    },
    style: computerStyle,
  },
  {
    id: 'microprocessors',
    position: { x: -1400, y: 225 },
    type: 'custom',
    data: {
      label: `${EEMap.get('microprocessors')} `,
      courseId: 112,
      title: 'microprocessors',
    },
    style: ElectricityStyle,
  },
  {
    id: 'microcontrollerApplications',
    position: { x: -1400, y: 350 },
    type: 'custom',
    data: {
      label: `${EEMap.get('microcontrollerApplications')} `,
      courseId: 113,
      title: 'microcontrollerApplications',
    },
    style: ElectricityStyle,
  },
  {
    id: 'microcontrollerApplicationsLab',
    position: { x: -1300, y: 500 },
    type: 'custom',
    data: {
      label: `${EEMap.get('microcontrollerApplicationsLab')} `,
      courseId: 114,
      title: 'microcontrollerApplicationsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'computerApplications',
    position: { x: -1550, y: 500 },
    type: 'custom',
    data: {
      label: `${EEMap.get('computerApplications')} `,
      courseId: 115,
      title: 'computerApplications',
    },
    style: ElectricityStyle,
  },
];
