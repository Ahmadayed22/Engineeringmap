// const nodeStyle = {
//   backgroundColor: '#d1e8ff', // 💙 light blue
//   color: '#003366',
//   border: '2px solid #3399ff',
//   fontWeight: 'bold',
//   fontSize: 14,
// };
const baseNodeStyle = {
  fontFamily: 'Tajawal, sans-serif',
  color: '#ffffff',
  border: '2px solid #ffffff',
  fontWeight: 'bold',
  // fontSize: 'clamp(14px, 1.2vw, 18px)',
  fontSize: '14px',
  // width: '150px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};
const baseNodeStyle2 = {
  fontFamily: 'Tajawal, sans-serif',
  color: '#ffffff',
  border: '2px solid #ffffff',
  fontWeight: 'bold',
  // fontSize: 'clamp(14px, 1.2vw, 18px)',
  fontSize: '14px',
  cursor: 'pointer',
  width: '125px',
  height: '125px',
  borderRadius: '50%',
  // textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const RootStyle = {
  ...baseNodeStyle,
  backgroundColor: 'black',
  // border: '2px solid #3399ff',
};

const nodeStyle = {
  ...baseNodeStyle,
  backgroundColor: 'black',
  // border: '2px solid #3399ff',
};

const ItStyle = {
  ...baseNodeStyle,
  backgroundColor: '#ffa500',
};

const SciencesStyle = {
  ...baseNodeStyle,
  backgroundColor: '#079cba',
};

const ElectricityStyle = {
  ...baseNodeStyle,
  backgroundColor: '#008000',
};

const MechatronicsStyle = {
  ...baseNodeStyle,
  backgroundColor: '#631d3b',
};

export {
  RootStyle,
  nodeStyle,
  ItStyle,
  SciencesStyle,
  ElectricityStyle,
  MechatronicsStyle,
};
