import { type Node } from '@xyflow/react';
import { nodeStyle as style } from './NodeStyle';
import {
  RootStyle,
  ItStyle,
  SciencesStyle,
  ElectricityStyle,
  MechatronicsStyle,
} from './NodeStyle';
import { CPE } from './StaticNodeValue';

// Create a map from CPE for easy lookup
const CPEMap = new Map(CPE.map((item) => [item.id, item.value]));

const initialNodes: Node[] = [
  {
    id: 'root',
    position: { x: -150, y: -400 },
    data: {
      label: CPEMap.get('root'),
      title: 'root',
    },
    type: 'input',
    style: {
      width: 1500,
      ...RootStyle,
      fontSize: 30,
      padding: 15,
      borderRadius: 15,
      color: 'white',
    },
  },

  // First level
  {
    id: 'physics',
    position: { x: -950, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('physics')} `,
      courseId: 1,
      title: 'physics',
    },
    style: SciencesStyle,
  },
  {
    id: 'Discrete Mathematics',
    position: { x: -100, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('Discrete Mathematics')} `,
      courseId: 2,
      title: 'Discrete Mathematics',
    },
    style: ItStyle,
  },
  {
    id: 'csBasics',
    position: { x: 450, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('csBasics')} `,
      courseId: 3,
      title: 'Computer Basics',
    },
    style: ItStyle,
  },
  {
    id: 'statistics',
    position: { x: 800, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('statistics')} `,
      courseId: 4,
      title: 'statistics',
    },
    style: SciencesStyle,
  },
  {
    id: 'chemistry',
    position: { x: 1200, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('chemistry')} `,
      courseId: 5,
      title: 'chemistry',
    },
    style: SciencesStyle,
  },
  {
    id: 'calculus1',
    position: { x: 1750, y: -200 },
    type: 'custom',
    data: {
      label: `${CPEMap.get('calculus1')} `,
      courseId: 6,
      title: 'calculus1',
    },
    style: SciencesStyle,
  },

  // Second level of calculus1
  {
    id: 'calculus2',
    position: { x: 1600, y: -50 },
    type: 'custom',
    data: {
      label: CPEMap.get('calculus2'),
      courseId: 7,
      title: 'calculus2',
    },
    style: SciencesStyle,
  },
  {
    id: 'linearAlgebra',
    type: 'custom',
    position: { x: 1940, y: -50 },

    data: {
      label: CPEMap.get('linearAlgebra'),
      courseId: 8,
      title: 'linearAlgebra',
    },
    style: SciencesStyle,
  },
  // Second level of calculus2
  {
    id: 'calculus3',
    position: { x: 1750, y: 200 },
    type: 'custom',
    data: {
      label: CPEMap.get('calculus3'),
      courseId: 9,
      title: 'calculus3',
    },
    style: SciencesStyle,
  },
  {
    id: 'probability',
    type: 'custom',
    position: { x: 1450, y: 200 },

    data: {
      label: CPEMap.get('probability'),
      courseId: 10,
      title: 'probability',
    },
    style: { ...style },
  },
  // Second level of linearAlgebra
  {
    id: 'numericalAnalysisLab',
    type: 'custom',
    position: { x: 1940, y: 100 },
    data: {
      label: CPEMap.get('numericalAnalysisLab'),
      courseId: 11,
      title: 'numericalAnalysisLab',
    },
    style: style,
  },

  // second level of physics
  {
    id: 'physicsLab1',
    type: 'custom',
    position: { x: -1100, y: -75 },
    data: {
      label: CPEMap.get('physicsLab1'),
      courseId: 12,
      title: 'physicsLab1',
    },
    style: SciencesStyle,
  },
  {
    id: 'physics2',
    position: { x: -850, y: -75 },
    type: 'custom',
    data: {
      label: CPEMap.get('physics2'),
      courseId: 13,
      title: 'physics2',
    },
    style: SciencesStyle,
  },
  // second level of physics2
  {
    id: 'electricCircuits',
    type: 'custom',
    position: { x: -1000, y: 50 },
    data: {
      label: CPEMap.get('electricCircuits'),
      courseId: 14,
      title: 'electricCircuits',
    },
    style: ElectricityStyle,
  },
  {
    id: 'physicsLab2',
    type: 'custom',
    position: { x: -750, y: 50 },
    data: {
      label: CPEMap.get('physicsLab2'),
      courseId: 15,
      title: 'physicsLab2',
    },
    style: SciencesStyle,
  },
  // second level of electricCircuits
  {
    id: 'electronics1',
    type: 'custom',
    position: { x: -1450, y: 200 },
    data: {
      label: CPEMap.get('electronics1'),
      courseId: 16,
      title: 'electronics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuitsLab',
    type: 'custom',
    position: { x: -1150, y: 200 },
    data: {
      label: CPEMap.get('electricCircuitsLab'),
      courseId: 17,
      title: 'electricCircuitsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems',
    type: 'custom',
    position: { x: -900, y: 200 },
    data: {
      label: CPEMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricalMachines',
    type: 'custom',
    position: { x: -650, y: 200 },
    data: {
      label: CPEMap.get('electricalMachines'),
      courseId: 19,
      title: 'electricalMachines',
    },
    style: MechatronicsStyle,
  },
  // second level of electronics1
  {
    id: 'digitalElectronicsVLSI',
    type: 'custom',
    position: { x: -1521, y: 350 },
    data: {
      label: CPEMap.get('digitalElectronicsVLSI'),
      courseId: 20,
      title: 'digitalElectronicsVLSI',
    },
    style: style,
  },
  {
    id: 'digitalElectronicsVLSILab',
    type: 'custom',
    position: { x: -1545, y: 500 },
    data: {
      label: CPEMap.get('digitalElectronicsVLSILab'),
      courseId: 21,
      title: 'digitalElectronicsVLSILab',
    },
    style: style,
  },

  //second level of csBasics
  {
    id: 'c++',
    type: 'custom',
    position: { x: -200, y: -50 },
    data: {
      label: CPEMap.get('c++'),
      courseId: 22,
      title: 'c++',
    },
    style: style,
  },
  {
    id: 'digitalLogic',
    type: 'custom',
    position: { x: 975, y: -50 },
    data: {
      label: CPEMap.get('digitalLogic'),
      courseId: 23,
      title: 'digitalLogic',
    },
    style: style,
  },

  // second level of c++
  {
    id: 'java',
    type: 'custom',
    position: { x: -450, y: 100 },
    data: {
      label: CPEMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  {
    id: 'python',
    type: 'custom',
    position: { x: -50, y: 100 },
    data: {
      label: CPEMap.get('python'),
      courseId: 25,
      title: 'python',
    },
    style: style,
  },
  // second level of java
  {
    id: 'softwareEngineering',
    type: 'custom',
    position: { x: -625, y: 400 },
    data: {
      label: CPEMap.get('softwareEngineering'),
      courseId: 26,
      title: 'softwareEngineering',
    },
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms',
    type: 'custom',
    position: { x: -448, y: 500 },
    data: {
      label: CPEMap.get('dataStructuresAlgorithms'),
      courseId: 27,
      title: 'dataStructuresAlgorithms',
    },
    style: style,
  },
  // second level of dataStructuresAlgorithms
  {
    id: 'mobileComputing',
    type: 'custom',
    position: { x: -1400, y: 700 },
    data: {
      label: CPEMap.get('mobileComputing'),
      courseId: 28,
      title: 'mobileComputing',
    },
    style: style,
  },
  {
    id: 'databaseSystems',
    type: 'custom',
    position: { x: -1095, y: 700 },
    data: {
      label: CPEMap.get('databaseSystems'),
      courseId: 29,
      title: 'databaseSystems',
    },
    style: ItStyle,
  },
  {
    id: 'modernOperatingSystems',
    type: 'custom',
    position: { x: -850, y: 700 },
    data: {
      label: CPEMap.get('modernOperatingSystems'),
      courseId: 30,
      title: 'modernOperatingSystems',
    },
    style: style,
  },
  {
    id: 'computerArchitecture2',
    type: 'custom',
    position: { x: -600, y: 700 },
    data: {
      label: CPEMap.get('design'),
      courseId: 43,
      title: 'design',
    },
    style: style,
  },
  {
    id: 'competitiveProgramming',
    type: 'custom',
    position: { x: -300, y: 700 },
    data: {
      label: CPEMap.get('competitiveProgramming'),
      courseId: 31,
      title: 'competitiveProgramming',
    },
    style: style,
  },
  // second level of design
  {
    id: 'parallelProcessors',
    type: 'custom',
    position: { x: -590, y: 850 },
    data: {
      label: CPEMap.get('parallelProcessors'),
      courseId: 32,
      title: 'parallelProcessors',
    },
    style: style,
  },
  // second level of parallelProcessors
  {
    id: 'parallelProcessorsLab',
    type: 'custom',
    position: { x: -590, y: 1000 },
    data: {
      label: CPEMap.get('parallelProcessorsLab'),
      courseId: 33,
      title: 'parallelProcessorsLab',
    },
    style: style,
  },
  // second level of python
  {
    id: 'signalsSystems2',
    type: 'custom',
    position: { x: -200, y: 225 },
    data: {
      label: CPEMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'linearAlgebra2',
    type: 'custom',
    position: { x: 70, y: 225 },
    data: {
      label: CPEMap.get('linearAlgebra'),
      courseId: 8,
      title: 'linearAlgebra',
    },
    style: style,
  },
  // second level of signalsSystems2
  {
    id: 'digitalImageProcessing',
    type: 'custom',
    position: { x: -251, y: 410 },
    data: {
      label: CPEMap.get('digitalImageProcessing'),
      courseId: 34,
      title: 'digitalImageProcessing',
    },
    style: style,
  },
  // second level of linearAlgebra2
  {
    id: 'aiAndMachineLearning',
    type: 'custom',
    position: { x: -25, y: 600 },
    data: {
      label: CPEMap.get('aiAndMachineLearning'),
      courseId: 35,
      title: 'aiAndMachineLearning',
    },
    style: style,
  },
  // second level of aiAndMachineLearning
  {
    id: 'computerVision',
    type: 'custom',
    position: { x: -350, y: 900 },
    data: {
      label: CPEMap.get('computerVision'),
      courseId: 36,
      title: 'computerVision',
    },
    style: style,
  },
  {
    id: 'computationalIntelligence',
    type: 'custom',
    position: { x: -100, y: 900 },
    data: {
      label: CPEMap.get('computationalIntelligence'),
      courseId: 37,
      title: 'computationalIntelligence',
    },
    style: style,
  },
  {
    id: 'advancedMLTopics',
    type: 'custom',
    position: { x: 150, y: 900 },
    data: {
      label: CPEMap.get('advancedMLTopics'),
      courseId: 38,
      title: 'advancedMLTopics',
    },
    style: style,
  },
  {
    id: 'dataScience',
    type: 'custom',
    position: { x: 500, y: 900 },
    data: {
      label: CPEMap.get('dataScience'),
      courseId: 39,
      title: 'dataScience',
    },
    style: style,
  },

  // second level of digitalLogic  position: { x: 950, y: 200 },
  {
    id: 'c++2',
    type: 'custom',
    position: { x: 300, y: 100 },
    data: {
      label: CPEMap.get('c++'),
      courseId: 22,
      title: 'c++',
    },
    style: style,
  },
  {
    id: 'digitalLogicLab',
    type: 'custom',
    position: { x: 675, y: 100 },
    data: {
      label: CPEMap.get('digitalLogicLab'),
      courseId: 40,
      title: 'digitalLogicLab',
    },
    style: style,
  },
  {
    id: 'electronics2',
    type: 'custom',
    position: { x: 970, y: 100 },
    data: {
      label: CPEMap.get('electronics1'),
      courseId: 16,
      title: 'electronics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems3',
    type: 'custom',
    position: { x: 1300, y: 100 },
    data: {
      label: CPEMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  // second level of c++2
  {
    id: 'computerArchitecture',
    type: 'custom',
    position: { x: 310, y: 300 },
    data: {
      label: CPEMap.get('computerArchitecture'),
      courseId: 41,
      title: 'computerArchitecture',
    },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'advancedDigitalDesign',
    type: 'custom',
    position: { x: 115, y: 450 },
    data: {
      label: CPEMap.get('advancedDigitalDesign'),
      courseId: 42,
      title: 'advancedDigitalDesign',
    },
    style: style,
  },
  {
    id: 'digitalLogicLab2',
    type: 'custom',
    position: { x: 430, y: 450 },
    data: {
      label: CPEMap.get('digitalLogicLab'),
      courseId: 40,
      title: 'digitalLogicLab',
    },
    style: style,
  },
  {
    id: 'design',
    type: 'custom',
    position: { x: 665, y: 450 },
    data: {
      label: CPEMap.get('design'),
      courseId: 43,
      title: 'design',
    },
    style: style,
  },
  //second level of digitalLogicLab2
  {
    id: 'computerOrganizationLab',
    type: 'custom',
    position: { x: 430, y: 600 },
    data: {
      label: CPEMap.get('computerOrganizationLab'),
      courseId: 44,
      title: 'computerOrganizationLab',
    },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'java2',
    type: 'custom',
    position: { x: 662, y: 650 },
    data: {
      label: CPEMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  // second level of java2
  {
    id: 'optimizedCompilers',
    type: 'custom',
    position: { x: 632, y: 815 },
    data: {
      label: CPEMap.get('optimizedCompilers'),
      courseId: 45,
      title: 'optimizedCompilers',
    },
    style: style,
  },
  // second level of electronics2
  {
    id: 'embeddedSystems',
    type: 'custom',
    position: { x: 970, y: 250 },
    data: {
      label: CPEMap.get('embeddedSystems'),
      courseId: 46,
      title: 'embeddedSystems',
    },
    style: style,
  },
  // second level of embeddedSystems
  {
    id: 'computerNetworks',
    type: 'custom',
    position: { x: 845, y: 375 },
    data: {
      label: CPEMap.get('computerNetworks'),
      courseId: 47,
      title: 'computerNetworks',
    },
    style: style,
  },
  {
    id: 'embeddedSystemsLab',
    type: 'custom',
    position: { x: 1100, y: 375 },
    data: {
      label: CPEMap.get('embeddedSystemsLab'),
      courseId: 48,
      title: 'embeddedSystemsLab',
    },
    style: style,
  },
  // second level of computerNetworks
  {
    id: 'internetOfThings',
    type: 'custom',
    position: { x: 845, y: 535 },
    data: {
      label: CPEMap.get('internetOfThings'),
      courseId: 49,
      title: 'internetOfThings',
    },
    style: style,
  },
  // second level of embeddedSystemsLab
  {
    id: 'signalsAndSystems',
    type: 'custom',
    position: { x: 1100, y: 535 },
    data: {
      label: CPEMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'controlSystems',
    type: 'custom',
    position: { x: 1100, y: 670 },
    data: {
      label: CPEMap.get('controlSystems'),
      courseId: 50,
      title: 'controlSystems',
    },
    style: style,
  },
  {
    id: 'mobileRobots',
    type: 'custom',
    position: { x: 1093, y: 825 },
    data: {
      label: CPEMap.get('mobileRobots'),
      courseId: 51,
      title: 'mobileRobots',
    },
    style: MechatronicsStyle,
  },
  // second level of signalsSystems3
  {
    id: 'computerNetworks2',
    type: 'custom',
    position: { x: 1300, y: 900 },
    data: {
      label: CPEMap.get('computerNetworks'),
      courseId: 47,
      title: 'computerNetworks',
    },
    style: style,
  },

  // معمارية وتنظيم الحاسوب 1 (already exists in your initialNodes)
  {
    id: 'computerArchitecture2+',
    type: 'custom',
    position: { x: 600, y: 1050 }, // Position near other network courses
    data: {
      label: CPEMap.get('computerArchitecture'),
      courseId: 41,
      title: 'computerArchitecture',
    },
    style: style,
  },
  // الشبكات الاسلكية (اختياري)
  {
    id: 'wirelessNetworks',
    type: 'custom',
    position: { x: 875, y: 1050 }, // Position near other network courses
    data: {
      label: CPEMap.get('wirelessNetworks'),
      courseId: 52,
      title: 'wirelessNetworks',
    },
    style: style,
  },

  // مختبر شبكات الحاسوب
  {
    id: 'computerNetworksLab',
    type: 'custom',
    position: { x: 1150, y: 1050 }, // Position near computerNetworks
    data: {
      label: CPEMap.get('computerNetworksLab'),
      courseId: 53,
      title: 'computerNetworksLab',
    },
    style: style,
  },

  // حل المشاكل بالبرمجة الشيئية (already exists as java/java2)
  {
    id: 'objectOrientedProblemSolving',
    type: 'custom',
    position: { x: 1402, y: 1050 }, // Position near computerNetworks
    data: {
      label: CPEMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  // الحوسبة السحابية(اختياري)
  {
    id: 'cloudComputing',
    type: 'custom',
    position: { x: 1700, y: 1050 }, // Position in advanced topics area
    data: {
      label: CPEMap.get('cloudComputing'),
      courseId: 54,
      title: 'cloudComputing',
    },
    style: style,
  },

  // امن المعلومات والشبكات
  {
    id: 'informationSecurity',
    type: 'custom',
    position: { x: 1975, y: 1050 }, // Position near network courses
    data: {
      label: CPEMap.get('informationSecurity'),
      courseId: 55,
      title: 'informationSecurity',
    },
    style: style,
  },

  // أنظمة اتصالات البيانات
  {
    id: 'dataCommunicationSystems',
    type: 'custom',
    position: { x: 2250, y: 1050 }, // Position near signals/systems
    data: {
      label: CPEMap.get('dataCommunicationSystems'),
      courseId: 56,
      title: 'dataCommunicationSystems',
    },
    style: style,
  },

  // مواضيع مختارة في هندسة الحاسوب(اختياري)
  {
    id: 'selectedTopicsInCE',
    type: 'custom',
    position: { x: 533, y: 1225 }, // Position in advanced topics area
    data: {
      label: CPEMap.get('selectedTopicsInCE'),
      courseId: 57,
      title: 'selectedTopicsInCE',
    },
    style: style,
  },
  // last level
  // مختبر الشبكات المتقدم
  {
    id: 'advancedNetworksLab',
    type: 'custom',
    position: { x: 1150, y: 1225 }, // Position near networks labs
    data: {
      label: CPEMap.get('advancedNetworksLab'),
      courseId: 58,
      title: 'advancedNetworksLab',
    },
    style: style,
  },

  // برمجة بروتوكولات الشبكات
  {
    id: 'networkProtocolsProgramming',
    type: 'custom',
    position: { x: 1409, y: 1225 }, // Position near networks courses
    data: {
      label: CPEMap.get('networkProtocolsProgramming'),
      courseId: 59,
      title: 'networkProtocolsProgramming',
    },
    style: style,
  },

  // الادلة الرقمية (اختياري)
  {
    id: 'digitalForensics',
    type: 'custom',
    position: { x: 1975, y: 1225 }, // Position in security/advanced area
    data: {
      label: CPEMap.get('digitalForensics'),
      courseId: 60,
      title: 'digitalForensics',
    },
    style: style,
  },
];

export { initialNodes };
