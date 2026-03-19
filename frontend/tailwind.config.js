/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /^(bg|border|text)-(blue|amber|emerald|green|cyan|orange|purple|rose|violet|teal|fuchsia|sky|indigo)-(50|100|500|600)$/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
