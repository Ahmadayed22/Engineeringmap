import { type Edge } from '@xyflow/react';

import {
  style,
  // BlackStyle,
  // RedStyle,
  ElectricityStyle,
  SciencesStyle,
  ItStyle,
  MechatronicsStyle,
} from './EdgeColor';
const initialEdges: Edge[] = [
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
  // Second level of calculus1
  {
    id: 'calculus1-linearAlgebra',
    source: 'calculus1',
    target: 'linearAlgebra',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  {
    id: 'calculus1-calculus2',
    source: 'calculus1',
    target: 'calculus2',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  // Second level of calculus2

  {
    id: 'calculus2-calculus3',
    source: 'calculus2',
    target: 'calculus3',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  {
    id: 'calculus2-probability',
    source: 'calculus2',
    target: 'probability',
    type: 'smoothstep',
    style: style,
  },

  // Second level of linearAlgebra
  {
    id: 'linearAlgebra-numericalAnalysisLab',
    source: 'linearAlgebra',
    target: 'numericalAnalysisLab',
    type: 'smoothstep',
    style: style,
  },

  // seconf level of physics
  {
    id: 'physics-physicsLab1',
    source: 'physics',
    target: 'physicsLab1',
    type: 'smoothstep',
    style: {
      ...SciencesStyle,
      strokeDasharray: '5,5', // Creates dashed line
    },
  },

  {
    id: 'physics-physics2',
    source: 'physics',
    target: 'physics2',
    type: 'smoothstep',
    style: SciencesStyle,
  },
  // second level of physics2
  {
    id: 'physics2-physicsLab2',
    source: 'physics2',
    target: 'physicsLab2',
    type: 'smoothstep',
    style: {
      ...SciencesStyle,
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  {
    id: 'physics2-electricCircuits',
    source: 'physics2',
    target: 'electricCircuits',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  // second level of electricCircuits
  {
    id: 'electricCircuits-to-electronics1',
    source: 'electricCircuits', // assuming this is from first level
    target: 'electronics1',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuits-to-electricCircuitsLab',
    source: 'electricCircuits',
    target: 'electricCircuitsLab',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuits-to-signalsSystems',
    source: 'electricCircuits',
    target: 'signalsSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'math2-to-signalsSystems', // assuming math2 is prerequisite
    source: 'math2',
    target: 'signalsSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },

  {
    id: 'electricCircuits-to-electricalMachines',
    source: 'electricCircuits',
    target: 'electricalMachines',
    type: 'smoothstep',
    style: MechatronicsStyle,
  },
  // second level of electronics1
  {
    id: 'electronics1-to-digitalElectronicsVLSI',
    source: 'electronics1',
    target: 'digitalElectronicsVLSI',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'digitalElectronicsVLSI-to-digitalElectronicsVLSILab',
    source: 'digitalElectronicsVLSI',
    target: 'digitalElectronicsVLSILab',
    type: 'smoothstep',
    style: style,
  },

  //second level of csBasics
  {
    id: 'csBasics-to-c++',
    source: 'csBasics',
    target: 'c++',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'csBasics-to-digitalLogic',
    source: 'csBasics',
    target: 'digitalLogic',
    type: 'smoothstep',
    style: style,
  },
  // second level of c++
  {
    id: 'c++-to-java',
    source: 'c++',
    target: 'java',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'c++-to-python',
    source: 'c++',
    target: 'python',
    type: 'smoothstep',
    style: style,
  },
  // second level of java
  {
    id: 'java-to-softwareEngineering',
    source: 'java',
    target: 'softwareEngineering',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'java-to-dataStructuresAlgorithms',
    source: 'java',
    target: 'dataStructuresAlgorithms',
    type: 'smoothstep',
    style: style,
  },
  // second level of dataStructuresAlgorithms

  {
    id: 'dataStructuresAlgorithms-to-mobileComputing',
    source: 'dataStructuresAlgorithms',
    target: 'mobileComputing',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms-to-databaseSystems',
    source: 'dataStructuresAlgorithms',
    target: 'databaseSystems',
    type: 'smoothstep',
    style: ItStyle,
  },
  {
    id: 'dataStructuresAlgorithms-to-modernOperatingSystems',
    source: 'dataStructuresAlgorithms',
    target: 'modernOperatingSystems',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms-to-computerArchitecture2',
    source: 'dataStructuresAlgorithms',
    target: 'computerArchitecture2',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms-to-competitiveProgramming',
    source: 'dataStructuresAlgorithms',
    target: 'competitiveProgramming',
    type: 'smoothstep',
    style: style,
  },
  // second level of computerArchitecture2
  {
    id: 'computerArchitecture2-to-parallelProcessors',
    source: 'computerArchitecture2',
    target: 'parallelProcessors',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of parallelProcessors
  {
    id: 'parallelProcessors-to-parallelProcessorsLab',
    source: 'parallelProcessors',
    target: 'parallelProcessorsLab',
    type: 'smoothstep',
    style: style,
  },
  // second level of python
  {
    id: 'python-to-signalsSystems2',
    source: 'python',
    target: 'signalsSystems2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'python-to-linearAlgebra2',
    source: 'python',
    target: 'linearAlgebra2',
    type: 'smoothstep',
    style: style,
  },
  // second level of signalsSystems2
  {
    id: 'signalsSystems2-to-digitalImageProcessing',
    source: 'signalsSystems2',
    target: 'digitalImageProcessing',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of linearAlgebra2

  {
    id: 'linearAlgebra2-to-aiAndMachineLearning',
    source: 'linearAlgebra2',
    target: 'aiAndMachineLearning',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of aiAndMachineLearning
  {
    id: 'aiAndMachineLearning-to-computerVision',
    source: 'aiAndMachineLearning',
    target: 'computerVision',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'aiAndMachineLearning-to-computationalIntelligence',
    source: 'aiAndMachineLearning',
    target: 'computationalIntelligence',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'aiAndMachineLearning-to-advancedMLTopics',
    source: 'aiAndMachineLearning',
    target: 'advancedMLTopics',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'aiAndMachineLearning-to-dataScience',
    source: 'aiAndMachineLearning',
    target: 'dataScience',
    type: 'smoothstep',
    style: style,
  },
  // second level of digitalLogic
  {
    id: 'digitalLogic-to-c++2',
    source: 'digitalLogic',
    target: 'c++2',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'digitalLogic-to-digitalLogicLab',
    source: 'digitalLogic',
    target: 'digitalLogicLab',
    type: 'smoothstep',
    style: style,
  },
  {
    id: 'digitalLogic-to-electronics2',
    source: 'digitalLogic',
    target: 'electronics2',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: 'digitalLogic-to-signalsSystems3',
    source: 'digitalLogic',
    target: 'signalsSystems3',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  // second level of c++2
  {
    id: ' c++2-to-computerArchitecture',
    source: 'c++2',
    target: 'computerArchitecture',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },

  // second level of computerArchitecture
  {
    id: ' computerArchitecture-to-advancedDigitalDesign',
    source: 'computerArchitecture',
    target: 'advancedDigitalDesign',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerArchitecture-to-digitalLogicLab2',
    source: 'computerArchitecture',
    target: 'digitalLogicLab2',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerArchitecture-to-design',
    source: 'computerArchitecture',
    target: 'design',
    type: 'smoothstep',
    style: style,
  },
  //second level of digitalLogicLab2
  {
    id: ' digitalLogicLab2-to-computerOrganizationLab',
    source: 'digitalLogicLab2',
    target: 'computerOrganizationLab',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of computerArchitecture
  {
    id: ' design-to-java2',
    source: 'design',
    target: 'java2',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' java2-to-optimizedCompilers',
    source: 'java2',
    target: 'optimizedCompilers',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of electronics2
  {
    id: ' electronics2-to-embeddedSystems',
    source: 'electronics2',
    target: 'embeddedSystems',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of embeddedSystems
  {
    id: ' embeddedSystems-to-computerNetworks',
    source: 'embeddedSystems',
    target: 'computerNetworks',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' embeddedSystems-to-embeddedSystemsLab',
    source: 'embeddedSystems',
    target: 'embeddedSystemsLab',
    type: 'smoothstep',
    style: style,
  },
  // second level of computerNetworks
  {
    id: ' computerNetworks-to-internetOfThings',
    source: 'computerNetworks',
    target: 'internetOfThings',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  // second level of embeddedSystemsLab
  {
    id: ' embeddedSystemsLab-to-signalsAndSystems',
    source: 'embeddedSystemsLab',
    target: 'signalsAndSystems',
    type: 'smoothstep',
    style: ElectricityStyle,
  },
  {
    id: ' signalsAndSystems-to-controlSystems',
    source: 'signalsAndSystems',
    target: 'controlSystems',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  {
    id: ' controlSystems-to-mobileRobots',
    source: 'controlSystems',
    target: 'mobileRobots',
    type: 'smoothstep',
    style: MechatronicsStyle,
  },
  // second level of signalsSystems3

  {
    id: ' signalsSystems3-to-computerNetworks2',
    source: 'signalsSystems3',
    target: 'computerNetworks2',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  {
    id: ' computerNetworks2-to-computerArchitecture2+',
    source: 'computerNetworks2',
    target: 'computerArchitecture2+',
    type: 'smoothstep',
    style: style,
  },
  //
  {
    id: ' computerNetworks2-to-wirelessNetworks',
    source: 'computerNetworks2',
    target: 'wirelessNetworks',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerNetworks2-to-computerNetworksLab',
    source: 'computerNetworks2',
    target: 'computerNetworksLab',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerNetworks2-to-objectOrientedProblemSolving',
    source: 'computerNetworks2',
    target: 'objectOrientedProblemSolving',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerNetworks2-to-cloudComputing',
    source: 'computerNetworks2',
    target: 'cloudComputing',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerNetworks2-to-informationSecurity',
    source: 'computerNetworks2',
    target: 'informationSecurity',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' computerNetworks2-to-dataCommunicationSystems',
    source: 'computerNetworks2',
    target: 'dataCommunicationSystems',
    type: 'smoothstep',
    style: style,
  },
  // last level

  {
    id: ' computerArchitecture2+-to-selectedTopicsInCE',
    source: 'computerArchitecture2+',
    target: 'selectedTopicsInCE',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  {
    id: ' computerNetworksLab-to-advancedNetworksLab',
    source: 'computerNetworksLab',
    target: 'advancedNetworksLab',
    type: 'smoothstep',
    style: style,
  },
  {
    id: ' objectOrientedProblemSolving-to-networkProtocolsProgramming',
    source: 'objectOrientedProblemSolving',
    target: 'networkProtocolsProgramming',
    type: 'smoothstep',
    style: {
      ...style,
      stroke: 'black',
      strokeDasharray: '5,5', // Creates dashed line
    },
  },
  {
    id: ' informationSecurity-to-digitalForensics',
    source: 'informationSecurity',
    target: 'digitalForensics',
    type: 'smoothstep',
    style: style,
  },
];
export { initialEdges };
