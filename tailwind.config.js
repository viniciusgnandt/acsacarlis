/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./site/**/*.html"],
  theme: {
    extend: {
      colors: {
        marsala: { DEFAULT: '#800020', light: '#a13447', dark: '#5e0017' },
        rosa: { light: '#fce4ec', DEFAULT: '#f8bbd0', soft: '#fff5f7' }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    }
  },
  plugins: [],
}
