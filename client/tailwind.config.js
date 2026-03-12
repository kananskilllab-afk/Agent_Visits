/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                kanan: {
                    navy: '#1A3C6E',
                    blue: '#2E75B6',
                    light: '#E8F0FB',
                    accent: '#FFD700', // Gold/Yellow often goes well if needed, but not specified
                }
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
