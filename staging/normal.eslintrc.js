module.exports = {
  env: { es6: true },
  plugins: ["self"],
  rules: {
    "self/no-secrets": "error",
    "self/no-pattern-match": [
      "error",
      { patterns: { SecretJS: /const SECRET/, SecretJSON: /\"SECRET\"/ } },
    ],
  },
};
