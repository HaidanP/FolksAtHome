/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        cream: {
          DEFAULT: '#F5EED6',
          dark:    '#EAE0C4',
        },
        forest: {
          DEFAULT: '#6B8E7F',
          dark:    '#4A6B6B',
        },
        terra:   '#D4664A',
        blossom: '#F4C2C2',
        charcoal: '#1F1F1F',
        'warm-gray': '#5A5A5A',
      },
    },
  },
  plugins: [],
}
