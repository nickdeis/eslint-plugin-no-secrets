module.exports = {
  env: { es6: true },
  extends: ["plugin:jsonc/base"],
  plugins: ["self"],
  rules: {
    "self/no-secrets": "error",
    "self/no-pattern-match": [
      "error",
      { patterns: { SecretJS: /const SECRET/, SecretJSON: /\"SECRET\"/ } },
    ],
  },
};
