/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A3D2E',
          light: '#2A5C46',
          dark: '#0E241A',
          foreground: '#FFFFFF'
        },
        accent: {
          DEFAULT: '#F5B82E',
          light: '#F8CA62',
          dark: '#D59D1A',
          foreground: '#1A3D2E'
        },
      },
    },
  },
  plugins: [],
}