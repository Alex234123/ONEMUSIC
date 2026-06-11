/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        brand: {
          red: '#FA586A',
          purple: '#C084FC',
          indigo: '#6366F1',
        },
        surface: {
          dark: '#000000',
          base: '#121212',
          card: 'rgba(255,255,255,0.06)',
          hover: 'rgba(255,255,255,0.10)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          muted: 'rgba(255,255,255,0.4)',
        },
      },
      fontFamily: {
        sans: [
          'SF Pro Display',
          'SF Pro Text',
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang SC',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      borderRadius: {
        'card': '12px',
        'lg-card': '16px',
        'pill': '999px',
      },
      backdropBlur: {
        'mica': '30px',
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'spin-slow': 'spin 20s linear infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(250, 88, 106, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(250, 88, 106, 0)' },
        },
      },
    },
  },
  plugins: [],
};