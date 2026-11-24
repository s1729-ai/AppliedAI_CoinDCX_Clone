/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        coindcx: {
          dark: '#0b0e14',
          card: '#121722',
          cardHover: '#181f2d',
          border: '#1f2937',
          blue: '#0052fe',
          blueHover: '#1652f0',
          cyan: '#00d395',
          green: '#00c076',
          greenBg: 'rgba(0, 192, 118, 0.12)',
          red: '#f6465d',
          redBg: 'rgba(246, 70, 93, 0.12)',
          gold: '#f0b90b',
          muted: '#848e9c',
          text: '#eaecef',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
