/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        munnay: {
          50: '#FBF8EF',   // Lightest - backgrounds
          100: '#F3EAD2',  // Very light - card backgrounds
          200: '#E7D2A0',  // Light - borders, subtle accents
          300: '#DAB66F',  // Medium-light - hover states
          400: '#D29F4D',  // Medium - secondary buttons
          500: '#C88338',  // Primary - main buttons, active states
          600: '#AA632D',  // Medium-dark - sidebar active
          700: '#934C2A',  // Dark - text accents
          800: '#793E27',  // Darker - strong text
          900: '#643423',  // Darkest - headers, strong emphasis
        },
      },
      fontFamily: {
        sans: ['Inter', 'Nunito Sans', 'Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.10)',
      },
      transitionProperty: {
        'all': 'all',
      },
      transitionDuration: {
        '300': '300ms',
      },
      transitionTimingFunction: {
        'ease': 'ease',
      },
    },
  },
  plugins: [],
}