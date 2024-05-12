const noSecret = require("..");
module.exports = {
    languageOptions: { ecmaVersion: 6 },
    "plugins": {
        "no-secrets":noSecret
    },
    "rules": {
      "no-secrets/no-secrets": "error"
    }
}