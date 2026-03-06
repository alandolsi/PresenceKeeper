/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        panel: '#0f1728',
        panelSoft: '#17243a',
        line: '#29415d',
        accent: '#22d3ee',
        accentStrong: '#0891b2',
        danger: '#fb7185',
        dangerStrong: '#be123c'
      },
      boxShadow: {
        pulse: '0 0 0 0 rgba(34,211,238,0.5)'
      }
    }
  },
  plugins: []
};
