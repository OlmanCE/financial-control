// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'rgb(250, 250, 250)',
          100: 'rgb(244, 244, 245)',
          200: 'rgb(228, 228, 231)',
          300: 'rgb(212, 212, 216)',
          400: 'rgb(161, 161, 170)',
          500: 'rgb(113, 113, 122)',
          600: 'rgb(82, 82, 91)',
          700: 'rgb(63, 63, 70)',
          800: 'rgb(39, 39, 42)',
          900: 'rgb(24, 24, 27)',
          950: 'rgb(9, 9, 11)',
        },
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
        '2xl': '3rem',
        '3xl': '4rem',
      },
      borderRadius: {
        'sm': '0.375rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
  plugins: [],
}