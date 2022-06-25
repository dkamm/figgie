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
      animation: {
        blink: "blink 300ms ease-in",
      },
      keyframes: {
        blink: {
          from: { border: "solid 2px white" },
          to: { border: "solid 0px white" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("daisyui")],
};
