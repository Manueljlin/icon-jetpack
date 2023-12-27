import type { Config } from "tailwindcss"


const config = {

  content: [
    "./src/**/*.{html,js,svelte,ts}"
  ],

  theme: {
    extend: {},
  },

  plugins: [
    require('@tailwindcss/container-queries'),
  ],

} satisfies Config


export default config
