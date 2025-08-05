import './style.css';

const baseNodeStyle = {
  fontFamily: 'Tajawal, sans-serif',
  // border: '1px solid #ffffff',
  fontWeight: 'bold',
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  borderRadius: 10,
  // Choose one of these animations:
  // animation: 'dashBorder 2s linear infinite', // Moving border segments
  // animation: 'movingDash 2s linear infinite', // Moving dashed border
  // animation: 'rotateBorder 3s linear infinite', // Rotating border
  // animation: 'pulseBorder 2s ease-in-out infinite', // Pulsing glow effect
  // animation: 'glowBorder 1.5s ease-in-out infinite', // Glowing border
  // animation: 'dashBorder2 2s ease-in-out infinite ',
};

const RootStyle = {
  ...baseNodeStyle,
  backgroundColor: 'black',
};

const nodeStyle = {
  ...baseNodeStyle,
  backgroundColor: 'black',
};

const ItStyle = {
  ...baseNodeStyle,
  backgroundColor: '#a87716',
};

const SciencesStyle = {
  ...baseNodeStyle,
  backgroundColor: '#0f3460',
};

const ElectricityStyle = {
  ...baseNodeStyle,
  backgroundColor: '#166e25',
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
