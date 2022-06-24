module.exports = {
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        8: "repeat(8, minmax(0, 1fr))",
        12: "repeat(12, minmax(0, 1fr))",
      },
      colors: {
        player: {
          0: "#EB5353",
          1: "#F9D923",
          2: "#36AE7C",
          3: "#187498",
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
