/** @type {import('tailwindcss').Config} */

module.exports = {
    // purge: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
    theme: {
        extend: {},
    },
    variants: {
        extend: {
            cursor: ['disabled'],
            margin: ['first'],
        },
    },
    plugins: [],
    important: ".sa",
    prefix: 'sa-',
    corePlugins: {
        preflight: false,
    }
}
