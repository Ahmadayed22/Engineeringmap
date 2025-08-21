import axios from 'axios';

axios.defaults.baseURL =
  process.env.REACT_APP_API_URL || 'https://engineeringmap.onrender.com';
// axios.defaults.baseURL = ' http://localhost:8080';

export default axios;
