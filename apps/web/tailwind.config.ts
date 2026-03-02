import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: "#f0fdf4",
                    100: "#eef2fc",
                    200: "#dee7fd",
                    300: "#d0dbf9",
                    400: "#a9bdf2",
                    500: "#3b5bdb",
                    600: "#324db8",
                    700: "#273c8f",
                    800: "#1e2b61",
                    900: "#151e40",
                    dark: "#1c1e21",
                },
                accent: {
                    green: "#4ade80",
                    red: "#ef4444",
                    yellow: "#fef08a",
                }
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            animation: {
                "float": "float 6s ease-in-out infinite",
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-10px)" },
                }
            }
        },
    },
    plugins: [],
};
export default config;
