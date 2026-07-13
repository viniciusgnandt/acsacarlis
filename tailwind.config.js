/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./site/**/*.html", "./partials/**/*.html", "./src/pages/**/*.html"],
  theme: {
    extend: {
      colors: {
        marsala: { DEFAULT: '#800020', light: '#a13447', dark: '#5e0017' },
        rosa: { light: '#fce4ec', DEFAULT: '#f8bbd0', soft: '#fff5f7' },
        gold: { light: '#e6c87a', DEFAULT: '#c9a24b', dark: '#a8842e' }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
