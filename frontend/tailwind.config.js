// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Define your custom color palette
      colors: {
        "brand-dark": "#0D0D0D", // Website background color
        primary: "#ADFF2F", // Primary brand color (lime green)
        stroke: "#38373A", // Stroke color for borders
        "hero-start": "#1B1B1C", // Start color for the hero gradient
      },
      // Define your custom font family
      fontFamily: {
        // This makes 'Bricolage Grotesque' the default sans-serif font
        sans: ['"Bricolage Grotesque"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
