/** @type {import('tailwindcss').Config} */
const { nextui } = require("@nextui-org/react");
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lightblue: "#5f9df7",
        darkerblue: "#1746A2",
        darkblue: "#1746A2",
        lightred: "#dd7373",
        lighterwhite: "#efefef",
      },
      fontFamily: {
        //sans: ["Montserrat", "Open Sans", "sans-serif"],
        sans: ["Montserrat", "Open Sans"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        "innosoft-light": {
          extend: "light",
          colors: {
            background: "#efefef",
            foreground: "#000",
            primary: {
              DEFAULT: "#181D50",
              foreground: "#ffffff",
            },
            warning: {
              DEFAULT: "#dd7373",
              foreground: "#181D50",
            },
            focus: "transparent",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "4px",
              medium: "6px",
              large: "8px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),
  ],
};
