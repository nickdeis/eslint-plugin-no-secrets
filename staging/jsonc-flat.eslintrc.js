const noSecret = require("..");
const jsoncExtend = require("eslint-plugin-jsonc");

module.exports = [
    ...jsoncExtend.configs['flat/recommended-with-jsonc'],
    {
        languageOptions: { ecmaVersion: 6 },
        "plugins": {
            "no-secrets":noSecret
        },
        "rules": {
          "no-secrets/no-secrets": "error"
        }
    }
]