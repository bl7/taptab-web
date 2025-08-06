/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        // App theme colors - minimalist black & white with controlled accents
        primary: {
          DEFAULT: '#000000', // Black
          foreground: '#ffffff', // White
        },
        secondary: {
          DEFAULT: '#ffffff', // White
          foreground: '#000000', // Black  
        },
        muted: {
          DEFAULT: '#f5f5f5', // Light gray background
          foreground: '#6b7280', // Gray 500
        },
        accent: {
          DEFAULT: '#f9fafb', // Gray 50
          foreground: '#111827', // Gray 900
        },
        destructive: {
          DEFAULT: '#ef4444', // Red 500 - only for actual destructive actions
          foreground: '#ffffff',
        },
        success: {
          DEFAULT: '#10b981', // Emerald 500 - only for success states
          foreground: '#ffffff',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber 500 - only for warnings  
          foreground: '#ffffff',
        },
        border: '#e5e7eb', // Gray 200
        input: '#e5e7eb', // Gray 200
        ring: '#000000', // Black for focus rings
      },
    },
  },
  plugins: [],
} 