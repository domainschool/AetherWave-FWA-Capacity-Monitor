/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blink': 'blink 1.2s infinite ease-in-out',
        'flow-glow': 'flowGlow 6s infinite alternate',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: '1', filter: 'brightness(1)' },
          '50%': { opacity: '0.4', filter: 'brightness(1.5)' },
        },
        flowGlow: {
          '0%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)' },
          '100%': { boxShadow: '0 0 25px rgba(244, 63, 94, 0.25)' }
        }
      }
    },
  },
  plugins: [],
}
