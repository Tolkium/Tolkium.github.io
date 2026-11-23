/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Geist', 'Outfit', 'sans-serif'],
        'outfit': ['Geist', 'Outfit', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
        'metal': ['Metal Mania', 'cursive'],
      }
    },
  },
  plugins: [],
}
