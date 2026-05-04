/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#161121',
        surface: '#1e1929',
        primary: '#d3bcf9',
        secondary: '#e9c349',
        tertiary: '#fbbc00',
        'surface-dim': '#100b1b',
        obsidian: '#0F0A1A',
        'deep-purple': '#2D1B4D',
        gold: '#D4AF37',
        amber: '#FFBF00'
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        sans: ['Manrope', 'sans-serif'],
      },
      animation: {
        'in': 'in .2s ease-out',
        'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        in: {
          '0%': { opacity: 0, transform: 'scale(0.95)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 15px rgba(255, 191, 0, 0.5)' },
          '50%': { opacity: .8, boxShadow: '0 0 25px rgba(255, 191, 0, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
