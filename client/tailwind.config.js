/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    navy:   '#393185',  // Deep navy – sidebar/nav
                    blue:   '#284695',  // Primary blue – CTAs
                    sky:    '#00A0E3',  // Sky blue – highlights/links
                    gold:   '#E19D19',  // Gold – accents/active indicator
                    purple: '#9C2BE3',  // Purple – roles/badges
                    lime:   '#B0CB1F',  // Lime – success/active status
                    orange: '#EF7F1A',  // Orange – warnings/pending
                    green:  '#009846',  // Green – completed/success
                },
                kanan: {
                    navy:  '#393185',
                    blue:  '#284695',
                    sky:   '#00A0E3',
                    light: '#EEF4FF',
                    accent:'#E19D19',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
            },
            boxShadow: {
                'card':    '0 1px 2px rgba(0,0,0,0.04), 0 4px 8px rgba(0,0,0,0.04)',
                'card-lg': '0 4px 6px rgba(0,0,0,0.05), 0 10px 20px rgba(0,0,0,0.06)',
                'sidebar': '4px 0 20px rgba(57,49,133,0.12)',
                'nav':     '0 4px 16px rgba(57,49,133,0.15)',
            },
            backgroundImage: {
                'sidebar-gradient': 'linear-gradient(180deg, #393185 0%, #2a245e 100%)',
                'brand-gradient':   'linear-gradient(135deg, #284695 0%, #00A0E3 100%)',
                'gold-gradient':    'linear-gradient(135deg, #E19D19 0%, #EF7F1A 100%)',
            },
            animation: {
                'fade-in':    'fadeIn 0.3s ease-out',
                'slide-up':   'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.25s ease-out',
            },
            keyframes: {
                fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
                slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
                slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
            },
        },
    },
    plugins: [],
}
