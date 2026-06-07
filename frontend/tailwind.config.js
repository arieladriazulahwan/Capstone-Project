/** @type {import('tailwindcss').Config} */
// Trigger rebuild
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sora: "#163A2A",
        kaili: "#D6A338",
        cream: "#FDFBF7",
        night: "#08100C",
        nightCard: "#112017"
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}