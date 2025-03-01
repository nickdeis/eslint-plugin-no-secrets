const noSecret = require("../dist");
module.exports = {
  languageOptions: { ecmaVersion: 6 },
  plugins: {
    "no-secrets": noSecret,
  },
  rules: {
    "no-secrets/no-secrets": "error",
    "no-secrets/no-pattern-match": [
      "error",
      { patterns: { SecretJS: /const SECRET/, SecretJSON: /\"SECRET\"/ } },
    ],
  },
};
