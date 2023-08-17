const withMT = require("@material-tailwind/react/utils/withMT");
module.exports = withMT({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "path-to-your-node_modules/@material-tailwind/react/components/**/*.{js,ts,jsx,tsx}",
    "path-to-your-node_modules/@material-tailwind/react/theme/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    fontFamily: {
      regular: ['Mulish-Regular'],
      medium: ['Mulish-medium'],
      bold: ['Mulish-bold']
    },
    extend: {
      colors: {
        primary: '#F8913D',
        secondary: '#494A9E',
        tertiary: '#FFF2E3'
      },
    },
  },
  plugins: [],
})
