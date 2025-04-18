/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        custom: {
          'bg': '#0F172A',
          'primary': '#1B4F72',
          'primary-hover': '#4682B4',
          'secondary': '#F18F75',
          'error': '#D36D5A',
          'text': '#FFFFFF',
          'detail': '#DADADA',
          'accent': '#10B981',
          'card': '#1E293B',
        },
      },
      boxShadow: {
        'custom': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'custom-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'custom': '1rem',
      },
    },
  },
  plugins: [],
} 