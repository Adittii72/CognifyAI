import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'light-pink': '#FFB6D9',
        'dark-pink': '#D147A3',
        'light-purple': '#C5A3FF',
        'dark-purple': '#7B2CBF',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #FFB6D9 0%, #D147A3 25%, #C5A3FF 75%, #7B2CBF 100%)',
        'gradient-secondary': 'linear-gradient(to right, #FFB6D9, #C5A3FF)',
        'gradient-accent': 'linear-gradient(to bottom, #D147A3, #7B2CBF)',
      },
    },
  },
  plugins: [],
};
export default config;
