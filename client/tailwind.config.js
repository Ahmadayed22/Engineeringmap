/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,ts,jsx,tsx}', // ✅ this is important
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin'), // ✅ required for Flowbite
  ],
};
