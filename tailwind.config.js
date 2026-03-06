/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        panel: '#0e1730',
        panelSoft: '#13244a',
        line: '#2b4274',
        brandSky: '#9adbef',
        brandBlue: '#9eaeea',
        brandDeep: '#5c73bf',
        brandNight: '#2a3974'
      },
      boxShadow: {
        pulse: '0 0 0 0 rgba(34,211,238,0.5)'
      }
    }
  },
  plugins: []
};
