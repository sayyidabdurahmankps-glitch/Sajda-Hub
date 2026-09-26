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
        // The deep blue primary palette
        ocean: {
          50: '#F4F7FB',
          100: '#E4ECF5',
          200: '#C1D5E7',
          300: '#7DA0CA',
          500: '#5483B3',
          600: '#3A6B9C',
          700: '#25517E',
          800: '#075A8A',
          900: '#052659',
          950: '#021024',
        },
        // The text color palette (replacing standard slate)
        ink: {
          500: '#64748B',
          600: '#475569',
          900: '#0F172A',
          950: '#0B1726',
        },
        // Structural borders
        line: {
          DEFAULT: '#E2E8F0', // standard line
          strong: '#CBD5E1',  // line-strong
        },
        // Specific wing branding colors
        wing: {
          dawa: { DEFAULT: '#2563EB', soft: '#EFF6FF' },
          adarsham: { DEFAULT: '#4F46E5', soft: '#EEF2FF' },
          sargam: { DEFAULT: '#9333EA', soft: '#FAF5FF' },
          publishing: { DEFAULT: '#D97706', soft: '#FFFBEB' },
        }
      },
      boxShadow: {
        'ocean-sm': '0 4px 20px 0 rgba(2, 16, 36, 0.04)',
        'ocean-md': '0 12px 30px 0 rgba(2, 16, 36, 0.08)',
      }
    },
  },
  plugins: [],
};
export default config;