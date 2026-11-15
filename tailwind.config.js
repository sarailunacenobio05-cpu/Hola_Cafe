/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#E7DDD3',
          300: '#D2C0B0',
          400: '#A48268',
          500: '#7B583E',
          600: '#5C3E28',
          700: '#4A2E1B',
          800: '#3A1F13',
          900: '#2C1810',
          950: '#1A0E0A',
        },
        amber: {
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
