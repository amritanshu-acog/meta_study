/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "tooltip-bg": "#000",
        "tooltip-text": "#fff",
      },
    },
  },
  plugins: [],
};
