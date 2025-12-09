/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Bhutanese flag-inspired colors
        'druk-yellow': '#FFC72C',
        'druk-orange': '#FF6B35',
        'druk-red': '#E63946',
        'druk-gold': '#F4A261',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
