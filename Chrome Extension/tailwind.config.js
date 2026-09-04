/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,html}",
    "./popup.html",
    "./sidepanel.html"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          100: '#d9eaff',
          200: '#bcdbff',
          300: '#8ec3ff',
          400: '#58a0ff',
          500: '#2f7dfc',
          600: '#1b5ff0',
          700: '#154ad9',
          800: '#173dae',
          900: '#193689',
          950: '#102254',
        }
      }
    },
  },
  plugins: [],
}
