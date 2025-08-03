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
    position: { x: 300, y: 0 },
    data: { label: staticValuesMap.get('root') || '' },
    type: 'input',
    style: { width: 800, ...RootStyle, fontSize: 20 },
  },

  // First level
  {
    id: 'physics',
    position: { x: -650, y: 100 },
    data: { label: staticValuesMap.get('physics') || '' },
    style: SciencesStyle,
  },
  {
    id: 'Discrete Mathematics',
    position: { x: 100, y: 100 },
    data: { label: staticValuesMap.get('Discrete Mathematics') || '' },
    style: ItStyle,
  },
  {
    id: 'csBasics',
    position: { x: 500, y: 100 },
    data: { label: staticValuesMap.get('csBasics') || '' },
    style: ItStyle,
  },
  {
    id: 'statistics',
    position: { x: 750, y: 100 },
    data: { label: staticValuesMap.get('statistics') || '' },
    style: SciencesStyle,
  },
  {
    id: 'chemistry',
    position: { x: 1000, y: 100 },
    data: { label: staticValuesMap.get('chemistry') || '' },
    style: SciencesStyle,
  },
  {
    id: 'calculus1',
    position: { x: 1550, y: 100 },
    data: { label: staticValuesMap.get('calculus1') || '' },
    style: SciencesStyle,
  },

  // Second level of calculus1
  {
    id: 'calculus2',
    position: { x: 1450, y: 200 },
    data: { label: staticValuesMap.get('calculus2') || '' },
    style: SciencesStyle,
  },
  {
    id: 'linearAlgebra',
    type: 'default',
    position: { x: 1650, y: 200 },
    data: { label: staticValuesMap.get('linearAlgebra') || '' },
    style: SciencesStyle,
  },
  // Second level of calculus2
  {
    id: 'calculus3',
    position: { x: 1550, y: 300 },
    data: { label: staticValuesMap.get('calculus3') || '' },
    style: SciencesStyle,
  },
  {
    id: 'probability',
    type: 'default',
    position: { x: 1350, y: 300 },
    data: { label: staticValuesMap.get('probability') || '' },
    style: { ...style },
  },
  // Second level of linearAlgebra
  {
    id: 'numericalAnalysisLab',
    type: 'default',
    position: { x: 1650, y: 400 },
    data: { label: staticValuesMap.get('numericalAnalysisLab') || '' },
    style: style,
  },

  // second level of physics
  {
    id: 'physicsLab1',
    type: 'default',
    position: { x: -750, y: 200 },
    data: { label: staticValuesMap.get('physicsLab1') || '' },
    style: SciencesStyle,
  },
  {
    id: 'physics2',
    position: { x: -550, y: 200 },
    data: { label: staticValuesMap.get('physics2') || '' },
    style: SciencesStyle,
  },
  // second level of physics2
  {
    id: 'electricCircuits',
    type: 'default',
    position: { x: -650, y: 300 },
    data: { label: staticValuesMap.get('electricCircuits') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'physicsLab2',
    type: 'default',
    position: { x: -450, y: 300 },
    data: { label: staticValuesMap.get('physicsLab2') || '' },
    style: SciencesStyle,
  },
  // second level of electricCircuits
  {
    id: 'electronics1',
    type: 'default',
    position: { x: -1050, y: 400 },
    data: { label: staticValuesMap.get('electronics1') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'electricCircuitsLab',
    type: 'ElectricityStyle',
    position: { x: -850, y: 400 },
    data: { label: staticValuesMap.get('electricCircuitsLab') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems',
    type: 'default',
    position: { x: -650, y: 400 },
    data: { label: staticValuesMap.get('signalsSystems') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'electricalMachines',
    type: 'default',
    position: { x: -450, y: 400 },
    data: { label: staticValuesMap.get('electricalMachines') || '' },
    style: MechatronicsStyle,
  },
  // second level of electronics1
  {
    id: 'digitalElectronicsVLSI',
    type: 'default',
    position: { x: -1050, y: 500 },
    data: { label: staticValuesMap.get('digitalElectronicsVLSI') || '' },
    style: style,
  },
  {
    id: 'digitalElectronicsVLSILab',
    type: 'default',
    position: { x: -1050, y: 600 },
    data: { label: staticValuesMap.get('digitalElectronicsVLSILab') || '' },
    style: style,
  },

  //second level of csBasics
  {
    id: 'c++',
    type: 'default',
    position: { x: -100, y: 200 },
    data: { label: staticValuesMap.get('c++') || '' },
    style: style,
  },
  {
    id: 'digitalLogic',
    type: 'default',
    position: { x: 950, y: 200 },
    data: { label: staticValuesMap.get('digitalLogic') || '' },
    style: style,
  },

  // second level of c++
  {
    id: 'java',
    type: 'default',
    position: { x: -275, y: 350 },
    data: { label: staticValuesMap.get('java') || '' },
    style: style,
  },
  {
    id: 'python',
    type: 'default',
    position: { x: 0, y: 350 },
    data: { label: staticValuesMap.get('python') || '' },
    style: style,
  },
  // second level of java
  {
    id: 'softwareEngineering',
    type: 'default',
    position: { x: -400, y: 600 },
    data: { label: staticValuesMap.get('softwareEngineering') || '' },
    style: style,
  },
  {
    id: 'dataStructuresAlgorithms',
    type: 'default',
    position: { x: -200, y: 600 },
    data: { label: staticValuesMap.get('dataStructuresAlgorithms') || '' },
    style: style,
  },
  // second level of dataStructuresAlgorithms
  {
    id: 'mobileComputing',
    type: 'default',
    position: { x: -1000, y: 900 },
    data: { label: staticValuesMap.get('mobileComputing') || '' },
    style: style,
  },
  {
    id: 'databaseSystems',
    type: 'default',
    position: { x: -800, y: 900 },
    data: { label: staticValuesMap.get('databaseSystems') || '' },
    style: ItStyle,
  },
  {
    id: 'modernOperatingSystems',
    type: 'default',
    position: { x: -600, y: 900 },
    data: { label: staticValuesMap.get('modernOperatingSystems') || '' },
    style: style,
  },
  {
    id: 'computerArchitecture2',
    type: 'default',
    position: { x: -400, y: 900 },
    data: { label: staticValuesMap.get('design') || '' },
    style: style,
  },
  {
    id: 'competitiveProgramming',
    type: 'default',
    position: { x: -200, y: 900 },
    data: { label: staticValuesMap.get('competitiveProgramming') || '' },
    style: style,
  },
  // second level of design
  {
    id: 'parallelProcessors',
    type: 'default',
    position: { x: -400, y: 1050 },
    data: { label: staticValuesMap.get('parallelProcessors') || '' },
    style: style,
  },
  // second level of parallelProcessors
  {
    id: 'parallelProcessorsLab',
    type: 'default',
    position: { x: -400, y: 1150 },
    data: { label: staticValuesMap.get('parallelProcessorsLab') || '' },
    style: style,
  },
  // second level of python
  {
    id: 'signalsSystems2',
    type: 'default',
    position: { x: -100, y: 500 },
    data: { label: staticValuesMap.get('signalsSystems') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'linearAlgebra2',
    type: 'default',
    position: { x: 100, y: 500 },
    data: { label: staticValuesMap.get('linearAlgebra') || '' },
    style: style,
  },
  // second level of signalsSystems2
  {
    id: 'digitalImageProcessing',
    type: 'default',
    position: { x: -100, y: 750 },
    data: { label: staticValuesMap.get('digitalImageProcessing') || '' },
    style: style,
  },
  // second level of linearAlgebra2
  {
    id: 'aiAndMachineLearning',
    type: 'default',
    position: { x: 100, y: 650 },
    data: { label: staticValuesMap.get('aiAndMachineLearning') || '' },
    style: style,
  },
  // second level of aiAndMachineLearning
  {
    id: 'computerVision',
    type: 'default',
    position: { x: -100, y: 1050 },
    data: { label: staticValuesMap.get('computerVision') || '' },
    style: style,
  },
  {
    id: 'computationalIntelligence',
    type: 'default',
    position: { x: 100, y: 1050 },
    data: { label: staticValuesMap.get('computationalIntelligence') || '' },
    style: style,
  },
  {
    id: 'advancedMLTopics',
    type: 'default',
    position: { x: 300, y: 1050 },
    data: { label: staticValuesMap.get('advancedMLTopics') || '' },
    style: style,
  },
  {
    id: 'dataScience',
    type: 'default',
    position: { x: 500, y: 1050 },
    data: { label: staticValuesMap.get('dataScience') || '' },
    style: style,
  },

  // second level of digitalLogic  position: { x: 950, y: 200 },
  {
    id: 'c++2',
    type: 'default',
    position: { x: 450, y: 400 },
    data: { label: staticValuesMap.get('c++') || '' },
    style: style,
  },
  {
    id: 'digitalLogicLab',
    type: 'default',
    position: { x: 700, y: 400 },
    data: { label: staticValuesMap.get('digitalLogicLab') || '' },
    style: style,
  },
  {
    id: 'electronics2',
    type: 'default',
    position: { x: 950, y: 400 },
    data: { label: staticValuesMap.get('electronics1') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'signalsSystems3',
    type: 'default',
    position: { x: 1200, y: 400 },
    data: { label: staticValuesMap.get('signalsSystems') || '' },
    style: ElectricityStyle,
  },
  // second level of c++2
  {
    id: 'computerArchitecture',
    type: 'default',
    position: { x: 450, y: 500 },
    data: { label: staticValuesMap.get('computerArchitecture') || '' },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'advancedDigitalDesign',
    type: 'default',
    position: { x: 275, y: 700 },
    data: { label: staticValuesMap.get('advancedDigitalDesign') || '' },
    style: style,
  },
  {
    id: 'digitalLogicLab2',
    type: 'default',
    position: { x: 450, y: 700 },
    data: { label: staticValuesMap.get('digitalLogicLab') || '' },
    style: style,
  },
  {
    id: 'design',
    type: 'default',
    position: { x: 650, y: 700 },
    data: { label: staticValuesMap.get('design') || '' },
    style: style,
  },
  //second level of digitalLogicLab2
  {
    id: 'computerOrganizationLab',
    type: 'default',
    position: { x: 450, y: 800 },
    data: { label: staticValuesMap.get('computerOrganizationLab') || '' },
    style: style,
  },
  // second level of computerArchitecture
  {
    id: 'java2',
    type: 'default',
    position: { x: 650, y: 800 },
    data: { label: staticValuesMap.get('java') || '' },
    style: style,
  },
  // second level of java2
  {
    id: 'optimizedCompilers',
    type: 'default',
    position: { x: 650, y: 950 },
    data: { label: staticValuesMap.get('optimizedCompilers') || '' },
    style: style,
  },
  // second level of electronics2
  {
    id: 'embeddedSystems',
    type: 'default',
    position: { x: 950, y: 500 },
    data: { label: staticValuesMap.get('embeddedSystems') || '' },
    style: style,
  },
  // second level of embeddedSystems
  {
    id: 'computerNetworks',
    type: 'default',
    position: { x: 850, y: 600 },
    data: { label: staticValuesMap.get('computerNetworks') || '' },
    style: style,
  },
  {
    id: 'embeddedSystemsLab',
    type: 'default',
    position: { x: 1050, y: 600 },
    data: { label: staticValuesMap.get('embeddedSystemsLab') || '' },
    style: style,
  },
  // second level of computerNetworks
  {
    id: 'internetOfThings',
    type: 'default',
    position: { x: 850, y: 700 },
    data: { label: staticValuesMap.get('internetOfThings') || '' },
    style: style,
  },
  // second level of embeddedSystemsLab
  {
    id: 'signalsAndSystems',
    type: 'default',
    position: { x: 1050, y: 700 },
    data: { label: staticValuesMap.get('signalsSystems') || '' },
    style: ElectricityStyle,
  },
  {
    id: 'controlSystems',
    type: 'default',
    position: { x: 1050, y: 800 },
    data: { label: staticValuesMap.get('controlSystems') || '' },
    style: style,
  },
  {
    id: 'mobileRobots',
    type: 'default',
    position: { x: 1050, y: 900 },
    data: { label: staticValuesMap.get('mobileRobots') || '' },
    style: MechatronicsStyle,
  },
  // second level of signalsSystems3
  {
    id: 'computerNetworks2',
    type: 'default',
    position: { x: 1200, y: 500 },
    data: { label: staticValuesMap.get('computerNetworks') || '' },
    style: style,
  },

  // معمارية وتنظيم الحاسوب 2 (already exists in your initialNodes)
  {
    id: 'computerArchitecture2+',
    type: 'default',
    position: { x: 1200, y: 1200 }, // Position near other network courses
    data: { label: staticValuesMap.get('computerArchitecture') || '' },
    style: style,
  },
  // الشبكات الاسلكية (اختياري)
  {
    id: 'wirelessNetworks',
    type: 'default',
    position: { x: 1400, y: 1200 }, // Position near other network courses
    data: { label: staticValuesMap.get('wirelessNetworks') || '' },
    style: style,
  },

  // مختبر شبكات الحاسوب
  {
    id: 'computerNetworksLab',
    type: 'default',
    position: { x: 1600, y: 1200 }, // Position near computerNetworks
    data: { label: staticValuesMap.get('computerNetworksLab') || '' },
    style: style,
  },

  // حل المشاكل بالبرمجة الشيئية (already exists as java/java2)
  {
    id: 'objectOrientedProblemSolving',
    type: 'default',
    position: { x: 1800, y: 1200 }, // Position near computerNetworks
    data: { label: staticValuesMap.get('java') || '' },
    style: style,
  },
  // الحوسبة السحابية(اختياري)
  {
    id: 'cloudComputing',
    type: 'default',
    position: { x: 2000, y: 1200 }, // Position in advanced topics area
    data: { label: staticValuesMap.get('cloudComputing') || '' },
    style: style,
  },

  // امن المعلومات والشبكات
  {
    id: 'informationSecurity',
    type: 'default',
    position: { x: 2200, y: 1200 }, // Position near network courses
    data: { label: staticValuesMap.get('informationSecurity') || '' },
    style: style,
  },

  // أنظمة اتصالات البيانات
  {
    id: 'dataCommunicationSystems',
    type: 'default',
    position: { x: 2400, y: 1200 }, // Position near signals/systems
    data: { label: staticValuesMap.get('dataCommunicationSystems') || '' },
    style: style,
  },

  // مواضيع مختارة في هندسة الحاسوب(اختياري)
  {
    id: 'selectedTopicsInCE',
    type: 'default',
    position: { x: 1200, y: 1350 }, // Position in advanced topics area
    data: { label: staticValuesMap.get('selectedTopicsInCE') || '' },
    style: style,
  },
  // last level
  // مختبر الشبكات المتقدم
  {
    id: 'advancedNetworksLab',
    type: 'default',
    position: { x: 1600, y: 1350 }, // Position near networks labs
    data: { label: staticValuesMap.get('advancedNetworksLab') || '' },
    style: style,
  },

  // برمجة بروتوكولات الشبكات
  {
    id: 'networkProtocolsProgramming',
    type: 'default',
    position: { x: 1800, y: 1350 }, // Position near networks courses
    data: { label: staticValuesMap.get('networkProtocolsProgramming') || '' },
    style: style,
  },

  // الادلة الرقمية (اختياري)
  {
    id: 'digitalForensics',
    type: 'default',
    position: { x: 2200, y: 1350 }, // Position in security/advanced area
    data: { label: staticValuesMap.get('digitalForensics') || '' },
    style: style,
  },
];

export { initialNodes };
