const EE = [
  { id: 'root', value: '2019 - الخطة الشجرية للهندسة الكهربائية' },

  // رياضيات / علوم أساسية
  { id: 'calculus1', value: 'تفاضل وتكامل 1' },
  { id: 'calculus2', value: 'تفاضل وتكامل 2' },
  { id: 'calculus3', value: 'تفاضل وتكامل 3' },
  { id: 'engineeringEconomy', value: 'اقتصاد هندسي' },
  { id: 'engineeringProbability', value: 'الاحتمالات والإحصاء' },
  { id: 'engineeringMath1', value: 'التحليلات الهندسي 1' },
  { id: 'engineeringMath2', value: 'التحليلات الهندسي 2' },

  // فيزياء
  { id: 'physics1', value: 'الفيزياء العامة 1' },
  { id: 'physicsLab1', value: 'الفيزياء العملية 1' },
  { id: 'physics2', value: 'الفيزياء العامة 2' },
  { id: 'physicsLab2', value: 'الفيزياء العملية 2' },

  // أساسيات هندسية
  { id: 'descriptiveGeometry', value: 'الهندسة الوصفية' },
  { id: 'numericalMethods', value: 'الطرق العددية الهندسية' },
  { id: 'engineeringEthics', value: 'الأخلاقيات الهندسية' },

  // كهرباء أساسية
  { id: 'electricCircuits1', value: 'الدوائر الكهربائية 1' },
  { id: 'electricCircuits2', value: 'الدوائر الكهربائية 2' },
  { id: 'electricCircuitsLab', value: 'مختبر الدوائر الكهربائية' },
  { id: 'electromagnetics1', value: 'كهرومغناطيسية 1' },
  { id: 'electromagnetics2', value: 'كهرومغناطيسية 2' },

  // إلكترونيات
  { id: 'electronics1', value: 'الكترونيات 1' },
  { id: 'electronics2', value: 'الكترونيات 2' },
  { id: 'electronicsLab', value: 'مختبر الالكترونيات' },
  { id: 'advancedElectronicsLab', value: ' (خ) مختبر الاكترونيات متقدم' },
  { id: 'digitalElectronics', value: 'الكترونيات الرقمية' },
  { id: 'integratedCircuits', value: 'الدوائر المتكاملة' },
  { id: 'biomedicalElectronics', value: ' (خ) الكترونيات الطبية الحيوية' },
  { id: 'powerElectronics', value: 'الكترونيات القوى' },

  // آلات كهربائية وقوى
  { id: 'electricalMachines1', value: 'الآلات الكهربائية 1' },
  { id: 'electricalMachines2', value: 'الآلات الكهربائية 2' },
  { id: 'electricalMachinesLab', value: 'مختبر الآلات الكهربائية' },
  { id: 'electricDrives', value: ' (خ) القيادة الكهربائية' },
  { id: 'powerSystemAnalysis', value: 'تحليل أنظمة قوى' },
  { id: 'powerSystemProtection', value: 'حماية انظمة قوى' },
  { id: 'selectedTopicsPower', value: ' (خ) موضوعات مختارة في القوى والالات' },
  { id: 'highVoltageEngineering', value: '(خ) هندسة الجهد العالي' },
  { id: 'powerSystemOperations', value: '(خ) عمليات واقتصاد أنظمة القوى' },
  { id: 'powerSystemPlanning', value: '(خ) تخطيط انظمة القوى' },
  {
    id: 'renewableEnergyAndQuality',
    value: '(خ) الطاقة المتجددة وجودة انظمة القوى',
  },
  { id: 'powerLab', value: '(خ) مختبر القوى الكهربائية' },
  { id: 'advancedPowerLab', value: '(خ) مختبر القوى الكهربائية المتقدم' },

  // اتصالات
  { id: 'signalsAndSystems', value: 'تحليل إشارات وأنظمة' },
  { id: 'communications1', value: 'اتصالات (1)' },
  { id: 'communications2', value: 'اتصالات (2)' },
  { id: 'communicationElectronics', value: 'الكترونيات الاتصالات' },
  { id: 'communicationNetworks', value: '(خ) شبكات اتصال' },
  { id: 'digitalSignalProcessing', value: '(خ) اجراءات اشارية رقمية' },
  { id: 'opticalCommunications', value: '(خ) اتصالات بصرية' },
  {
    id: 'selectedTopicsCommunications',
    value: '(خ) موضوعات مختارة في الاتصالات والاكترونيات',
  },
  { id: 'mobileCommunications', value: '(خ) الاتصالات الخلوية' },
  { id: 'communicationsLab', value: 'مختبر الاتصالات' },
  { id: 'advancedCommunicationsLab', value: ' (خ) مختبر الاتصالات المتقدم' },
  { id: 'communicationSystems', value: 'أنظمة الاتصالات' },
  { id: 'antennasWavePropagation', value: 'الهوائيات وانتشار الموجات (خ)' },
  { id: 'multimediaStreaming', value: '(خ) بث الوسائل المتعددة' },

  // أنظمة وتحكم
  { id: 'controlSystems', value: 'أنظمة تحكم ' },
  { id: 'selectedTopicsControl', value: '(موضوعات مختارة في التحكم (خ' },
  { id: 'instrumentsAndControlLab', value: 'مختبر الاجهزة والتحكم' },

  // مواد حاسوب
  { id: 'csRemedial', value: 'مهارات الحاسوب الاستدراكية' },
  { id: 'csSkills', value: 'المهارات الحاسوبية للمهندسين' },
  { id: 'digitalLogic', value: 'المنطق الرقمي' },
  { id: 'digitalLogicLab', value: 'مختبر المنطق الرقمي' },
  { id: 'microprocessors', value: 'أنظمة المعالج الدقيق' },
  { id: 'microcontrollerApplications', value: 'تطبيقات التحكم الدقيق' },
  {
    id: 'microcontrollerApplicationsLab',
    value: 'مختبر تطبيقات التحكم الدقيق',
  },
  { id: 'computerApplications', value: '(خ) تطبيقات الحاسوب' },
];

export { EE };
