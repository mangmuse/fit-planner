/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base": "#111111",
        "bg-secondary": "#222222",
        "bg-surface": "#292929",
        "bg-surface-variant": "#333333",

        "text-muted": "#808080",
        "text-black": "#111111",
        "text-white": "#ffffff",

        "border-gray": "#d9d9d91A",

        primary: "#b0eb5f",
        warning: "#e05745",
      },
    },
  },
  plugins: [],
};
