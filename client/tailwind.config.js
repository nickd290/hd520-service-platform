/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          hover: '#334155',
          border: '#475569',
          text: '#e2e8f0'
        },
        primary: {
          blue: '#3b82f6',
          orange: '#f97316',
          green: '#10b981'
        }
      }
    },
  },
  plugins: [],
}
