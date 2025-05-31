/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Olive Green - Primary colors
        primary: {
          25: '#fafbf8',
          50: '#f7f8f4',
          100: '#eef0e8',
          200: '#dde2d2',
          300: '#c4cdb4',
          400: '#a6b491',
          500: '#8a9b73',
          600: '#6b7c56',
          700: '#556347',
          800: '#45523c',
          900: '#3a4533',
          950: '#1e2419',
        },
        // Cornsilk White - Secondary/Background colors
        secondary: {
          50: '#fffef7',
          100: '#fffceb',
          200: '#fff8d1',
          300: '#fff2a8',
          400: '#ffe97d',
          500: '#ffdc52',
          600: '#ffc82a',
          700: '#e6a815',
          800: '#cc8f0f',
          900: '#b37a0d',
          950: '#8a5a08',
        },
        // Light Green - Accent colors
        accent: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        // Instagram-inspired grays
        gray: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'instagram': '12px',
        'instagram-sm': '8px',
        'instagram-lg': '16px',
      },
      boxShadow: {
        'instagram': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'instagram-hover': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'instagram-card': '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
