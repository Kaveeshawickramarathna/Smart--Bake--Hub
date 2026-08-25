/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f97316', // Orange 500
        'primary-dark': '#ea580c', // Orange 600
        secondary: '#fefce8', // Yellow 50
        accent: '#84cc16', // Lime 500
        dark: '#1f2937', // Gray 800
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Great Vibes", "cursive"],
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        float: 'float 4s ease-in-out infinite',
        'float-3d': 'float-3d 6s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'float-3d': {
          '0%, 100%': {
            transform: 'perspective(1000px) translateY(0px) rotateX(0deg) rotateY(0deg)',
            boxShadow: '0 20px 40px rgba(74,60,49,0.05)',
          },
          '50%': {
            transform: 'perspective(1000px) translateY(-15px) rotateX(2deg) rotateY(-2deg)',
            boxShadow: '0 40px 60px rgba(74,60,49,0.15)',
          },
        },
      },
    },
  },
  plugins: [],
}
