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
        // Warm color palette from lightest to darkest
        cream: {
          50: '#FBF8EF',   // Lightest - backgrounds
          100: '#F3EAD2',  // Very light - cards, sections
          200: '#E7D2A0',  // Light - borders, dividers
          300: '#DAB66F',  // Medium light - hover states
          400: '#D29F4D',  // Medium - secondary buttons
          500: '#C88338',  // Primary - main actions
          600: '#AA632D',  // Dark - active states
          700: '#934C2A',  // Darker - text on light bg
          800: '#793E27',  // Very dark - headings
          900: '#643423',  // Darkest - body text
        },
        // Keep some utility colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'Nunito Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'button': '12px',
        'lg-card': '20px',
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.06)',
        'soft-md': '0 4px 12px rgba(0, 0, 0, 0.08)',
        'soft-lg': '0 8px 24px rgba(0, 0, 0, 0.1)',
        'soft-xl': '0 12px 32px rgba(0, 0, 0, 0.12)',
      },
      transition: {
        'smooth': 'all 0.3s ease',
      },
    },
  },
  plugins: [],
}