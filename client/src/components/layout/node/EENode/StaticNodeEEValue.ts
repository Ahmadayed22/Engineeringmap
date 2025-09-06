const EE = [
  { id: 'root', value: '2019 - الخطة الشجرية للهندسة الكهربائية' },

  // رياضيات / علوم أساسية
  { id: 'calculus1', value: 'تفاضل وتكامل 1' },
  { id: 'calculus2', value: 'تفاضل وتكامل 2' },
  { id: 'calculus3', value: 'تفاضل وتكامل 3' },
  { id: 'engineeringEconomy', value: 'اقتصاد هندسي' },
  { id: 'engineeringProbability', value: 'الاحتمالات والإحصاء' },
  { id: 'engineeringMath1', value: 'التحليل الهندسي 1' },
  { id: 'engineeringMath2', value: 'التحليل الهندسي 2' },

  // فيزياء
  { id: 'physics1', value: 'الفيزياء العامة 1' },
  { id: 'physicsLab1', value: 'الفيزياء العملية 1' },
  { id: 'physics2', value: 'الفيزياء العامة 2' },
  { id: 'physicsLab2', value: 'الفيزياء العملية 2' },

  // أساسيات هندسية
  { id: 'engineeringDrawing', value: 'الرسم الهندسي' },
  { id: 'descriptiveGeometry', value: 'الهندسة الوصفية' },
  { id: 'numericalMethods', value: 'الطرق العددية الهندسية' },
  { id: 'engineeringEthics', value: 'الاخلاقيات الهندسية' },

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
  { id: 'advancedElectronicsLab', value: 'مختبر الاكترونيات متقدم' },
  { id: 'digitalElectronics', value: 'الكترونيات الرقمية' },
  { id: 'integratedCircuits', value: 'الدوائر المتكاملة' },
  { id: 'biomedicalElectronics', value: 'الكترونيات الطبية الحيوية' },
  { id: 'powerElectronics', value: 'الكترونيات القوى' },

  // آلات كهربائية وقوى
  { id: 'electricalMachines1', value: 'الآلات الكهربائية 1' },
  { id: 'electricalMachines2', value: 'الآلات الكهربائية 2' },
  { id: 'electricalMachinesLab', value: 'مختبر الآلات الكهربائية' },
  { id: 'electricDrives', value: 'القيادة الكهربائية' },
  { id: 'powerSystemAnalysis', value: 'تحليل أنظمة قوى' },
  { id: 'powerSystemProtection', value: 'حماية انظمة قوى' },
  { id: 'selectedTopicsPower', value: 'موضوعات مختارة في القوى والالات' },
  { id: 'highVoltageEngineering', value: 'هندسة الجهد العالي' },
  { id: 'powerSystemOperations', value: 'عمليات واقتصاد أنظمة القوى' },
  { id: 'powerSystemPlanning', value: 'تخطيط انظمة القوى' },
  {
    id: 'renewableEnergyAndQuality',
    value: 'الطاقة المتجددة وجودة انظمة القوى',
  },
  { id: 'powerLab', value: 'مختبر القوى الكهربائية' },
  { id: 'advancedPowerLab', value: 'مختبر القوى الكهربائية المتقدم' },

  // اتصالات
  { id: 'signalsAndSystems', value: 'تحليل إشارات وأنظمة' },
  { id: 'communications1', value: 'اتصالات (1)' },
  { id: 'communications2', value: 'اتصالات (2)' },
  { id: 'communicationElectronics', value: 'الكترونيات الاتصالات' },
  { id: 'communicationNetworks', value: 'شبكات اتصال' },
  { id: 'digitalSignalProcessing', value: 'اجراءات اشارية رقمية' },
  { id: 'opticalCommunications', value: 'اتصالات بصرية' },
  {
    id: 'selectedTopicsCommunications',
    value: 'موضوعات مختارة في الاتصالات والاكترونيات',
  },
  { id: 'mobileCommunications', value: 'الاتصالات الخلوية' },
  { id: 'communicationsLab', value: 'مختبر الاتصالات' },
  { id: 'advancedCommunicationsLab', value: 'مختبر الاتصالات المتقدم' },
  { id: 'communicationSystems', value: 'أنظمة الاتصالات' },
  { id: 'antennasWavePropagation', value: 'الهوائيات وانتشار الموجات' },
  { id: 'multimediaStreaming', value: 'بث الوسائل المتعددة' },

  // أنظمة وتحكم
  { id: 'controlSystems1', value: 'أنظمة تحكم 1' },
  { id: 'selectedTopicsControl', value: 'موضوعات مختارة في التحكم' },
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
  { id: 'computerApplications', value: 'تطبيقات الحاسوب' },
];

export { EE };
