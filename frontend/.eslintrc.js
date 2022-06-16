module.exports = {
  env: {
    commonjs: true,
    node: true,
    browser: true,
    es6: true,
    jest: true,
  },
  extends: ["eslint:recommended", "plugin:react/recommended"],
  globals: {},
  parser: "@babel/eslint-parser",
  parserOptions: {
    sourceType: "module",
    ecmaFeatures: {
      globalReturn: false,
    },
    babelOptions: {
      configFile: "./.babelrc.json",
    },
  },
  plugins: ["react", "import", "react-hooks", "json-format"],
  ignorePatterns: ["node_modules/"],
  rules: {
    "react/prop-types": "off",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
