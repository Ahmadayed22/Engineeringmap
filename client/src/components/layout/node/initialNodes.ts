import { type Node } from '@xyflow/react';
import { nodeStyle as style } from './NodeStyle';
import {
  RootStyle,
  ItStyle,
  SciencesStyle,
  ElectricityStyle,
  MechatronicsStyle,
} from './NodeStyle';
import { staticValues } from './StaticNodeValue';

// Create a map from staticValues for easy lookup
const staticValuesMap = new Map(
  staticValues.map((item) => [item.id, item.value])
);

const initialNodes: Node[] = [
  {
    id: 'root',
    position: { x: -100, y: -100 },
    data: {
      label: staticValuesMap.get('root'),
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

  // First level
  {
    id: 'physics',
    position: { x: -650, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('physics')} `,
      courseId: 1,
      title: 'physics',
    },
    style: SciencesStyle,
  },
  {
    id: 'Discrete Mathematics',
    position: { x: 100, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('Discrete Mathematics')} `,
      courseId: 2,
      title: 'Discrete Mathematics',
    },
    style: ItStyle,
  },
  {
    id: 'csBasics',
    position: { x: 500, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('csBasics')} `,
      courseId: 3,
      title: 'Computer Basics',
    },
    style: ItStyle,
  },
  {
    id: 'statistics',
    position: { x: 750, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('statistics')} `,
      courseId: 4,
      title: 'statistics',
    },
    style: SciencesStyle,
  },
  {
    id: 'chemistry',
    position: { x: 1000, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('chemistry')} `,
      courseId: 5,
      title: 'chemistry',
    },
    style: SciencesStyle,
  },
  {
    id: 'calculus1',
    position: { x: 1550, y: 100 },
    type: 'default',
    data: {
      label: `${staticValuesMap.get('calculus1')} `,
      courseId: 6,
      title: 'calculus1',
    },
    style: SciencesStyle,
  },

  // Second level of calculus1
  {
    id: 'calculus2',
    position: { x: 1450, y: 200 },
    type: 'default',
    data: {
      label: staticValuesMap.get('calculus2'),
      courseId: 7,
      title: 'calculus2',
    },
    style: SciencesStyle,
  },
  {
    id: 'linearAlgebra',
    type: 'default',
    position: { x: 1650, y: 200 },
    type: 'default',
    data: {
      label: staticValuesMap.get('linearAlgebra'),
      courseId: 8,
      title: 'linearAlgebra',
    },
    style: SciencesStyle,
  },
  // Second level of calculus2
  {
    id: 'calculus3',
    position: { x: 1550, y: 300 },
    type: 'default',
    data: {
      label: staticValuesMap.get('calculus3'),
      courseId: 9,
      title: 'calculus3',
    },
    style: SciencesStyle,
  },
  {
    id: 'probability',
    type: 'default',
    position: { x: 1350, y: 300 },

    data: {
      label: staticValuesMap.get('probability'),
      courseId: 10,
      title: 'probability',
    },
    style: { ...style },
  },
  // Second level of linearAlgebra
  {
    id: 'numericalAnalysisLab',
    type: 'default',
    position: { x: 1650, y: 400 },
    data: {
      label: staticValuesMap.get('numericalAnalysisLab'),
      courseId: 11,
      title: 'numericalAnalysisLab',
    },
    style: style,
  },

  // second level of physics
  {
    id: 'physicsLab1',
    type: 'default',
    position: { x: -750, y: 200 },
    data: {
      label: staticValuesMap.get('physicsLab1'),
      courseId: 12,
      title: 'physicsLab1',
    },
    style: SciencesStyle,
  },
  {
    id: 'physics2',
    position: { x: -550, y: 200 },
    type: 'default',
    data: {
      label: staticValuesMap.get('physics2'),
      courseId: 13,
      title: 'physics2',
    },
    style: SciencesStyle,
  },
  // second level of physics2
  {
    id: 'electricCircuits',
    type: 'default',
    position: { x: -650, y: 300 },
    data: {
      label: staticValuesMap.get('electricCircuits'),
      courseId: 14,
      title: 'electricCircuits',
    },
    style: ElectricityStyle,
  },
  {
    id: 'physicsLab2',
    type: 'default',
    position: { x: -450, y: 300 },
    data: {
      label: staticValuesMap.get('physicsLab2'),
      courseId: 15,
      title: 'physicsLab2',
    },
    style: SciencesStyle,
  },
  // second level of electricCircuits
  {
    id: 'electronics1',
    type: 'default',
    position: { x: -1050, y: 400 },
    data: {
      label: staticValuesMap.get('electronics1'),
      courseId: 16,
      title: 'electronics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuitsLab',
    type: 'default',
    position: { x: -850, y: 400 },
    data: {
      label: staticValuesMap.get('electricCircuitsLab'),
      courseId: 17,
      title: 'electricCircuitsLab',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems',
    type: 'default',
    position: { x: -650, y: 400 },
    data: {
      label: staticValuesMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'electricalMachines',
    type: 'default',
    position: { x: -450, y: 400 },
    data: {
      label: staticValuesMap.get('electricalMachines'),
      courseId: 19,
      title: 'electricalMachines',
    },
    style: MechatronicsStyle,
  },
  // second level of electronics1
  {
    id: 'digitalElectronicsVLSI',
    type: 'default',
    position: { x: -1050, y: 500 },
    data: {
      label: staticValuesMap.get('digitalElectronicsVLSI'),
      courseId: 20,
      title: 'digitalElectronicsVLSI',
    },
    style: style,
  },
  {
    id: 'digitalElectronicsVLSILab',
    type: 'default',
    position: { x: -1050, y: 650 },
    data: {
      label: staticValuesMap.get('digitalElectronicsVLSILab'),
      courseId: 21,
      title: 'digitalElectronicsVLSILab',
    },
    style: style,
  },

  //second level of csBasics
  {
    id: 'c++',
    type: 'default',
    position: { x: -100, y: 200 },
    data: {
      label: staticValuesMap.get('c++'),
      courseId: 22,
      title: 'c++',
    },
    style: style,
  },
  {
    id: 'digitalLogic',
    type: 'default',
    position: { x: 950, y: 200 },
    data: {
      label: staticValuesMap.get('digitalLogic'),
      courseId: 23,
      title: 'digitalLogic',
    },
    style: style,
  },

  // second level of c++
  {
    id: 'java',
    type: 'default',
    position: { x: -275, y: 350 },
    data: {
      label: staticValuesMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  {
    id: 'python',
    type: 'default',
    position: { x: 0, y: 350 },
    data: {
      label: staticValuesMap.get('python'),
      courseId: 25,
      title: 'python',
    },
    style: style,
  },
  // second level of java
  {
    id: 'softwareEngineering',
    type: 'default',
    position: { x: -400, y: 600 },
    data: {
      label: staticValuesMap.get('softwareEngineering'),
      courseId: 26,
      title: 'softwareEngineering',
    },
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms',
    type: 'default',
    position: { x: -200, y: 600 },
    data: {
      label: staticValuesMap.get('dataStructuresAlgorithms'),
      courseId: 27,
      title: 'dataStructuresAlgorithms',
    },
    style: style,
  },
  // second level of dataStructuresAlgorithms
  {
    id: 'mobileComputing',
    type: 'default',
    position: { x: -1000, y: 900 },
    data: {
      label: staticValuesMap.get('mobileComputing'),
      courseId: 28,
      title: 'mobileComputing',
    },
    style: style,
  },
  {
    id: 'databaseSystems',
    type: 'default',
    position: { x: -800, y: 900 },
    data: {
      label: staticValuesMap.get('databaseSystems'),
      courseId: 29,
      title: 'databaseSystems',
    },
    style: ItStyle,
  },
  {
    id: 'modernOperatingSystems',
    type: 'default',
    position: { x: -600, y: 900 },
    data: {
      label: staticValuesMap.get('modernOperatingSystems'),
      courseId: 30,
      title: 'modernOperatingSystems',
    },
    style: style,
  },
  {
    id: 'computerArchitecture2',
    type: 'default',
    position: { x: -400, y: 900 },
    data: {
      label: staticValuesMap.get('design'),
      courseId: 43,
      title: 'design',
    },
    style: style,
  },
  {
    id: 'competitiveProgramming',
    type: 'default',
    position: { x: -200, y: 900 },
    data: {
      label: staticValuesMap.get('competitiveProgramming'),
      courseId: 31,
      title: 'competitiveProgramming',
    },
    style: style,
  },
  // second level of design
  {
    id: 'parallelProcessors',
    type: 'default',
    position: { x: -400, y: 1050 },
    data: {
      label: staticValuesMap.get('parallelProcessors'),
      courseId: 32,
      title: 'parallelProcessors',
    },
    style: style,
  },
  // second level of parallelProcessors
  {
    id: 'parallelProcessorsLab',
    type: 'default',
    position: { x: -400, y: 1150 },
    data: {
      label: staticValuesMap.get('parallelProcessorsLab'),
      courseId: 33,
      title: 'parallelProcessorsLab',
    },
    style: style,
  },
  // second level of python
  {
    id: 'signalsSystems2',
    type: 'default',
    position: { x: -100, y: 500 },
    data: {
      label: staticValuesMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'linearAlgebra2',
    type: 'default',
    position: { x: 100, y: 500 },
    data: {
      label: staticValuesMap.get('linearAlgebra'),
      courseId: 8,
      title: 'linearAlgebra',
    },
    style: style,
  },
  // second level of signalsSystems2
  {
    id: 'digitalImageProcessing',
    type: 'default',
    position: { x: -100, y: 750 },
    data: {
      label: staticValuesMap.get('digitalImageProcessing'),
      courseId: 34,
      title: 'digitalImageProcessing',
    },
    style: style,
  },
  // second level of linearAlgebra2
  {
    id: 'aiAndMachineLearning',
    type: 'default',
    position: { x: 100, y: 760 },
    data: {
      label: staticValuesMap.get('aiAndMachineLearning'),
      courseId: 35,
      title: 'aiAndMachineLearning',
    },
    style: style,
  },
  // second level of aiAndMachineLearning
  {
    id: 'computerVision',
    type: 'default',
    position: { x: -100, y: 1150 },
    data: {
      label: staticValuesMap.get('computerVision'),
      courseId: 36,
      title: 'computerVision',
    },
    style: style,
  },
  {
    id: 'computationalIntelligence',
    type: 'default',
    position: { x: 100, y: 1150 },
    data: {
      label: staticValuesMap.get('computationalIntelligence'),
      courseId: 37,
      title: 'computationalIntelligence',
    },
    style: style,
  },
  {
    id: 'advancedMLTopics',
    type: 'default',
    position: { x: 300, y: 1150 },
    data: {
      label: staticValuesMap.get('advancedMLTopics'),
      courseId: 38,
      title: 'advancedMLTopics',
    },
    style: style,
  },
  {
    id: 'dataScience',
    type: 'default',
    position: { x: 500, y: 1150 },
    data: {
      label: staticValuesMap.get('dataScience'),
      courseId: 39,
      title: 'dataScience',
    },
    style: style,
  },

  // second level of digitalLogic  position: { x: 950, y: 200 },
  {
    id: 'c++2',
    type: 'default',
    position: { x: 450, y: 400 },
    data: {
      label: staticValuesMap.get('c++'),
      courseId: 22,
      title: 'c++',
    },
    style: style,
  },
  {
    id: 'digitalLogicLab',
    type: 'default',
    position: { x: 700, y: 400 },
    data: {
      label: staticValuesMap.get('digitalLogicLab'),
      courseId: 40,
      title: 'digitalLogicLab',
    },
    style: style,
  },
  {
    id: 'electronics2',
    type: 'default',
    position: { x: 950, y: 400 },
    data: {
      label: staticValuesMap.get('electronics1'),
      courseId: 16,
      title: 'electronics1',
    },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems3',
    type: 'default',
    position: { x: 1225, y: 400 },
    data: {
      label: staticValuesMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  // second level of c++2
  {
    id: 'computerArchitecture',
    type: 'default',
    position: { x: 450, y: 600 },
    data: {
      label: staticValuesMap.get('computerArchitecture'),
      courseId: 41,
      title: 'computerArchitecture',
    },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'advancedDigitalDesign',
    type: 'default',
    position: { x: 275, y: 750 },
    data: {
      label: staticValuesMap.get('advancedDigitalDesign'),
      courseId: 42,
      title: 'advancedDigitalDesign',
    },
    style: style,
  },
  {
    id: 'digitalLogicLab2',
    type: 'default',
    position: { x: 450, y: 750 },
    data: {
      label: staticValuesMap.get('digitalLogicLab'),
      courseId: 40,
      title: 'digitalLogicLab',
    },
    style: style,
  },
  {
    id: 'design',
    type: 'default',
    position: { x: 650, y: 750 },
    data: {
      label: staticValuesMap.get('design'),
      courseId: 43,
      title: 'design',
    },
    style: style,
  },
  //second level of digitalLogicLab2
  {
    id: 'computerOrganizationLab',
    type: 'default',
    position: { x: 450, y: 900 },
    data: {
      label: staticValuesMap.get('computerOrganizationLab'),
      courseId: 44,
      title: 'computerOrganizationLab',
    },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'java2',
    type: 'default',
    position: { x: 650, y: 900 },
    data: {
      label: staticValuesMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  // second level of java2
  {
    id: 'optimizedCompilers',
    type: 'default',
    position: { x: 650, y: 1050 },
    data: {
      label: staticValuesMap.get('optimizedCompilers'),
      courseId: 45,
      title: 'optimizedCompilers',
    },
    style: style,
  },
  // second level of electronics2
  {
    id: 'embeddedSystems',
    type: 'default',
    position: { x: 950, y: 550 },
    data: {
      label: staticValuesMap.get('embeddedSystems'),
      courseId: 46,
      title: 'embeddedSystems',
    },
    style: style,
  },
  // second level of embeddedSystems
  {
    id: 'computerNetworks',
    type: 'default',
    position: { x: 850, y: 650 },
    data: {
      label: staticValuesMap.get('computerNetworks'),
      courseId: 47,
      title: 'computerNetworks',
    },
    style: style,
  },
  {
    id: 'embeddedSystemsLab',
    type: 'default',
    position: { x: 1050, y: 650 },
    data: {
      label: staticValuesMap.get('embeddedSystemsLab'),
      courseId: 48,
      title: 'embeddedSystemsLab',
    },
    style: style,
  },
  // second level of computerNetworks
  {
    id: 'internetOfThings',
    type: 'default',
    position: { x: 850, y: 800 },
    data: {
      label: staticValuesMap.get('internetOfThings'),
      courseId: 49,
      title: 'internetOfThings',
    },
    style: style,
  },
  // second level of embeddedSystemsLab
  {
    id: 'signalsAndSystems',
    type: 'default',
    position: { x: 1050, y: 800 },
    data: {
      label: staticValuesMap.get('signalsSystems'),
      courseId: 18,
      title: 'signalsSystems',
    },
    style: ElectricityStyle,
  },
  {
    id: 'controlSystems',
    type: 'default',
    position: { x: 1050, y: 950 },
    data: {
      label: staticValuesMap.get('controlSystems'),
      courseId: 50,
      title: 'controlSystems',
    },
    style: style,
  },
  {
    id: 'mobileRobots',
    type: 'default',
    position: { x: 1050, y: 1050 },
    data: {
      label: staticValuesMap.get('mobileRobots'),
      courseId: 51,
      title: 'mobileRobots',
    },
    style: MechatronicsStyle,
  },
  // second level of signalsSystems3
  {
    id: 'computerNetworks2',
    type: 'default',
    position: { x: 1225, y: 1050 },
    data: {
      label: staticValuesMap.get('computerNetworks'),
      courseId: 47,
      title: 'computerNetworks',
    },
    style: style,
  },

  // معمارية وتنظيم الحاسوب 1 (already exists in your initialNodes)
  {
    id: 'computerArchitecture2+',
    type: 'default',
    position: { x: 800, y: 1250 }, // Position near other network courses
    data: {
      label: staticValuesMap.get('computerArchitecture'),
      courseId: 41,
      title: 'computerArchitecture',
    },
    style: style,
  },
  // الشبكات الاسلكية (اختياري)
  {
    id: 'wirelessNetworks',
    type: 'default',
    position: { x: 1000, y: 1250 }, // Position near other network courses
    data: {
      label: staticValuesMap.get('wirelessNetworks'),
      courseId: 52,
      title: 'wirelessNetworks',
    },
    style: style,
  },

  // مختبر شبكات الحاسوب
  {
    id: 'computerNetworksLab',
    type: 'default',
    position: { x: 1225, y: 1250 }, // Position near computerNetworks
    data: {
      label: staticValuesMap.get('computerNetworksLab'),
      courseId: 53,
      title: 'computerNetworksLab',
    },
    style: style,
  },

  // حل المشاكل بالبرمجة الشيئية (already exists as java/java2)
  {
    id: 'objectOrientedProblemSolving',
    type: 'default',
    position: { x: 1400, y: 1250 }, // Position near computerNetworks
    data: {
      label: staticValuesMap.get('java'),
      courseId: 24,
      title: 'java',
    },
    style: style,
  },
  // الحوسبة السحابية(اختياري)
  {
    id: 'cloudComputing',
    type: 'default',
    position: { x: 1600, y: 1250 }, // Position in advanced topics area
    data: {
      label: staticValuesMap.get('cloudComputing'),
      courseId: 54,
      title: 'cloudComputing',
    },
    style: style,
  },

  // امن المعلومات والشبكات
  {
    id: 'informationSecurity',
    type: 'default',
    position: { x: 1800, y: 1250 }, // Position near network courses
    data: {
      label: staticValuesMap.get('informationSecurity'),
      courseId: 55,
      title: 'informationSecurity',
    },
    style: style,
  },

  // أنظمة اتصالات البيانات
  {
    id: 'dataCommunicationSystems',
    type: 'default',
    position: { x: 2000, y: 1250 }, // Position near signals/systems
    data: {
      label: staticValuesMap.get('dataCommunicationSystems'),
      courseId: 56,
      title: 'dataCommunicationSystems',
    },
    style: style,
  },

  // مواضيع مختارة في هندسة الحاسوب(اختياري)
  {
    id: 'selectedTopicsInCE',
    type: 'default',
    position: { x: 800, y: 1400 }, // Position in advanced topics area
    data: {
      label: staticValuesMap.get('selectedTopicsInCE'),
      courseId: 57,
      title: 'selectedTopicsInCE',
    },
    style: style,
  },
  // last level
  // مختبر الشبكات المتقدم
  {
    id: 'advancedNetworksLab',
    type: 'default',
    position: { x: 1225, y: 1400 }, // Position near networks labs
    data: {
      label: staticValuesMap.get('advancedNetworksLab'),
      courseId: 58,
      title: 'advancedNetworksLab',
    },
    style: style,
  },

  // برمجة بروتوكولات الشبكات
  {
    id: 'networkProtocolsProgramming',
    type: 'default',
    position: { x: 1400, y: 1400 }, // Position near networks courses
    data: {
      label: staticValuesMap.get('networkProtocolsProgramming'),
      courseId: 59,
      title: 'networkProtocolsProgramming',
    },
    style: style,
  },

  // الادلة الرقمية (اختياري)
  {
    id: 'digitalForensics',
    type: 'default',
    position: { x: 1800, y: 1400 }, // Position in security/advanced area
    data: {
      label: staticValuesMap.get('digitalForensics'),
      courseId: 60,
      title: 'digitalForensics',
    },
    style: style,
  },
];

export { initialNodes };
