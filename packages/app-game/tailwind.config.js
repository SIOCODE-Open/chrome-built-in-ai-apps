/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "public/**/*.html",
        "src/**/*.{js,jsx,ts,tsx}",
        "../base/src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                sioblue: "#002266",
            },
        },
    },
    plugins: [],
};
