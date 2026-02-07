import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                serif: ['var(--font-playfair)', 'serif'],
                display: ['var(--font-outfit)', 'sans-serif'],
                sans: ['var(--font-inter)', 'sans-serif'],
            },
            animation: {
                'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
                'entrance': 'fade-in-up 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                'float': 'float-fluid 35s ease-in-out infinite',
            },
            keyframes: {
                'fade-in-up': {
                    '0%': { opacity: '0', transform: 'translateY(40px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'float-fluid': {
                    '0%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(4vw, -6vh) scale(1.1)' },
                    '66%': { transform: 'translate(-3vw, 4vh) scale(0.95)' },
                    '100%': { transform: 'translate(0, 0) scale(1)' },
                }
            }
        },
    },
    plugins: [],
};
export default config;
