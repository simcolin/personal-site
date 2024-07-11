/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      fontFamily: {
        "monaspace": '"Monaspace Neon", monospace',
        "jetbrains": '"Jetbrains Mono", monospace',
      }
    },
  },
  plugins: [require("daisyui")],
}
