/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
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
        background: {
          DEFAULT: '#F9FAFB',
          dashboard: '#F3F4F6',
          card: '#FFFFFF'
        },
        border: '#E2E8F0',
      },
    },
  },
  plugins: [],
}