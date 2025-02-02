/**
 * Test for official ESLint JSON plugin
 */
const json = require("@eslint/json").default;
const noSecret = require("../dist");

module.exports = [
  // lint JSON files
  {
    plugins: {
      json,
      "no-secrets": noSecret,
    },
  },

  // lint JSON files
  {
    files: ["**/*.json"],
    language: "json/json",
    rules: {
      "no-secrets/no-secrets": "error",
      "no-secrets/no-pattern-match": [
        "error",
        { patterns: { SecretJS: /const SECRET/, SecretJSON: /\"SECRET\"/ } },
      ],
    },
  },
];
