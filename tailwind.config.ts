import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a1a1a',
        accent: '#c9a96e',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        heading: ['var(--font-playfair)', 'Playfair Display', 'Georgia', 'serif'],
        cormorant: ['var(--font-cormorant)', 'Cormorant Garamond', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
