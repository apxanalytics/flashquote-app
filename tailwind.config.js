/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1419',
          card: '#1a1f29',
          border: '#2d3748',
        },
        accent: {
          cyan: '#06b6d4',
          teal: '#14b8a6',
          green: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
