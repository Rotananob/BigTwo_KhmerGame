/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        table: {
          felt: '#1b4d3e',
          feltDark: '#12352a',
          rim: '#4a2e18',
          rimDark: '#2d1b0d',
          gold: '#d4af37',
        },
      },
      boxShadow: {
        'card': '0 4px 12px rgba(0, 0, 0, 0.25), 0 1px 3px rgba(0, 0, 0, 0.15)',
        'card-hover': '0 12px 24px rgba(0, 0, 0, 0.35), 0 4px 8px rgba(0, 0, 0, 0.2)',
        'table': 'inset 0 0 100px rgba(0,0,0,0.6)',
      },
    },
  },
  plugins: [],
}
