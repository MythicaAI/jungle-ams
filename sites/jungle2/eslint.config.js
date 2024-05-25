// eslint.config.js
module.exports = [
  {
    files: ["src/**/*.js", "src/**/*.ts"],
    ignores: ["**/*.config.js", "!**/eslint.config.js"],
    rules: {
      semi: "error",
      "prefer-const": "error"
    }
  }
];
