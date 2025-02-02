[![Build Status](https://github.com/nickdeis/eslint-plugin-no-secrets/actions/workflows/main.yml/badge.svg)](https://github.com/nickdeis/eslint-plugin-no-secrets/actions/workflows/main.yml/badge.svg)

# eslint-plugin-no-secrets

An eslint rule that searches for potential secrets/keys in code and JSON files.

This plugin has two rules:

- `no-secrets`: Find potential secrets using cryptographic entropy or patterns in the AST (acts like a standard eslint rule, more configurable)
- `no-pattern-match`: Find potential secrets in text (acts like `grep`, less configurable, but potentially more flexible)

---

<!-- vscode-markdown-toc -->

- 1. [Usage](#Usage)
  - 1.1. [Flat config](#Flatconfig)
  - 1.2. [eslintrc](#eslintrc)
  - 1.3. [Include JSON files](#IncludeJSONfiles)
    - 1.3.1. [Include JSON files with in "flat configs"](#IncludeJSONfileswithinflatconfigs)
- 2. [`no-secrets`](#no-secrets)
  - 2.1. [`no-secrets` examples](#no-secretsexamples)
  - 2.2. [When it's really not a secret](#Whenitsreallynotasecret)
    - 2.2.1. [ Either disable it with a comment](#Eitherdisableitwithacomment)
    - 2.2.2. [ use the `ignoreContent` to ignore certain content](#usetheignoreContenttoignorecertaincontent)
    - 2.2.3. [ Use `ignoreIdentifiers` to ignore certain variable/property names](#UseignoreIdentifierstoignorecertainvariablepropertynames)
    - 2.2.4. [ Use `additionalDelimiters` to further split up tokens](#UseadditionalDelimiterstofurthersplituptokens)
  - 2.3. [`no-secrets` Options](#no-secretsOptions)
- 3. [`no-pattern-match`](#no-pattern-match)
  - 3.1. [`no-pattern-match` options](#no-pattern-matchoptions)
- 4. [Acknowledgements](#Acknowledgements)

<!-- vscode-markdown-toc-config
	numbering=true
	autoSave=true
	/vscode-markdown-toc-config -->
<!-- /vscode-markdown-toc -->

## 1. <a name='Usage'></a>Usage

`npm i -D eslint-plugin-no-secrets`

### 1.1. <a name='Flatconfig'></a>Flat config

_eslint.config.js_

```js
import noSecrets from "eslint-plugin-no-secrets";

export default [
  {
    files: ["**/*.js"],
    plugins: {
      "no-secrets": noSecrets,
    },
    rules: {
      "no-secrets/no-secrets": "error",
    },
  },
];
```

### 1.2. <a name='eslintrc'></a>eslintrc

_.eslintrc_

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": "error"
  }
}
```

```js
//Found a string with entropy 4.3 : "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva"
const A_SECRET =
  "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
//Found a string that matches "AWS API Key" : "AKIAIUWUUQQN3GNUA88V"
const AWS_TOKEN = "AKIAIUWUUQQN3GNUA88V";
```

### 1.3. <a name='IncludeJSONfiles'></a>Include JSON files

To include JSON files, install `eslint-plugin-jsonc` or `@eslint/json` (if using ESLint version 9.6 or above)

`npm install --save-dev eslint-plugin-jsonc`

Then in your `.eslint` configuration file, extend the jsonc base config

```json
{
  "extends": ["plugin:jsonc/base"]
}
```

or if you are using ESLint 9.6 or above

```typescript
module.exports = [
  {
    plugins: {
      json,
      "no-secrets": noSecret,
    },
  },
  {
    files: ["**/*.json"],
    language: "json/json",
    ....
  },
];
```

#### 1.3.1. <a name='IncludeJSONfileswithinflatconfigs'></a>Include JSON files with in "flat configs"

_eslint.config.js_

```js
import noSecrets from "eslint-plugin-no-secrets";
import jsoncExtend from "eslint-plugin-jsonc";

export default [
  ...jsoncExtend.configs["flat/recommended-with-jsonc"],
  {
    languageOptions: { ecmaVersion: 6 },
    plugins: {
      "no-secrets": noSecrets,
    },
    rules: {
      "no-secrets/no-secrets": "error",
    },
  },
];
```

## 2. <a name='no-secrets'></a>`no-secrets`

`no-secrets` is a rule that does two things:

1. Search for patterns that often contain sensitive information
2. Measure cryptographic entropy to find potentially leaked secrets/passwords

It's modeled after early [truffleHog](https://github.com/dxa4481/truffleHog), but acts on ECMAscripts AST. This allows closer inspection into areas where secrets are commonly leaked like string templates or comments.

### 2.1. <a name='no-secretsexamples'></a>`no-secrets` examples

Decrease the tolerance for entropy

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": ["error", { "tolerance": 3.2 }]
  }
}
```

Add additional patterns to check for certain token formats.  
Standard patterns can be found [here](./regexes.js)

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": [
      "error",
      {
        "additionalRegexes": {
          "Basic Auth": "Authorization: Basic [A-Za-z0-9+/=]*"
        }
      }
    ]
  }
}
```

### 2.2. <a name='Whenitsreallynotasecret'></a>When it's really not a secret

#### 2.2.1. <a name='Eitherdisableitwithacomment'></a> Either disable it with a comment

```javascript
// Set of potential base64 characters
// eslint-disable-next-line no-secrets/no-secrets
const BASE64_CHARS =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
```

This will tell future maintainers of the codebase that this suspicious string isn't an oversight

#### 2.2.2. <a name='usetheignoreContenttoignorecertaincontent'></a> use the `ignoreContent` to ignore certain content

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": ["error", { "ignoreContent": "^ABCD" }]
  }
}
```

#### 2.2.3. <a name='UseignoreIdentifierstoignorecertainvariablepropertynames'></a> Use `ignoreIdentifiers` to ignore certain variable/property names

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": [
      "error",
      { "ignoreIdentifiers": ["BASE64_CHARS"] }
    ]
  }
}
```

#### 2.2.4. <a name='UseadditionalDelimiterstofurthersplituptokens'></a> Use `additionalDelimiters` to further split up tokens

Tokens will always be split up by whitespace within a string. However, sometimes words that are delimited by something else (e.g. dashes, periods, camelcase words). You can use `additionalDelimiters` to handle these cases.

For example, if you want to split words up by the character `.` and by camelcase, you could use this configuration:

```json
{
  "plugins": ["no-secrets"],
  "rules": {
    "no-secrets/no-secrets": [
      "error",
      { "additionalDelimiters": [".", "(?=[A-Z][a-z])"] }
    ]
  }
}
```

### 2.3. <a name='no-secretsOptions'></a>`no-secrets` Options

| Option               | Description                                                                                                                                                                            | Default | Type                                        |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------- |
| tolerance            | Minimum "randomness"/entropy allowed. Only strings **above** this threshold will be shown.                                                                                             | `4`     | `number`                                    |
| additionalRegexes    | Object of additional patterns to check. Key is check name and value is corresponding pattern                                                                                           | `{}`    | {\[regexCheckName:string]:string \| RegExp} |
| ignoreContent        | Will ignore the _entire_ string if matched. Expects either a pattern or an array of patterns. This option takes precedent over `additionalRegexes` and the default regular expressions | `[]`    | string \| RegExp \| (string\|RegExp)[]      |
| ignoreModules        | Ignores strings that are an argument in `import()` and `require()` or is the path in an `import` statement.                                                                            | `true`  | `boolean`                                   |
| ignoreIdentifiers    | Ignores the values of properties and variables that match a pattern or an array of patterns.                                                                                           | `[]`    | string \| RegExp \| (string\|RegExp)[]      |
| ignoreCase           | Ignores character case when calculating entropy. This could lead to some false negatives                                                                                               | `false` | `boolean`                                   |
| additionalDelimiters | In addition to splitting the string by whitespace, tokens will be further split by these delimiters                                                                                    | `[]`    | (string\|RegExp)[]                          |

## 3. <a name='no-pattern-match'></a>`no-pattern-match`

While this rule was originally made to take advantage of ESLint's AST, sometimes you may want to see if a pattern matches any text in a file, kinda like `grep`.

For example, if we configure as follows:

```js
import noSecrets from "eslint-plugin-no-secrets";

//Flat config

export default [
  {
    files: ["**/*.js"],
    plugins: {
      "no-secrets": noSecret,
    },
    rules: {
      "no-secrets/no-pattern-match": [
        "error",
        { patterns: { SecretJS: /const SECRET/, SecretJSON: /\"SECRET\"/ } },
      ],
    },
  },
];
```

We would match `const SECRET`, but not `var SECRET`. We would match keys that were called `"SECRET"` in JSON files if they were configured to be scanned.

### 3.1. <a name='no-pattern-matchoptions'></a>`no-pattern-match` options

| Option   | Description                                                       | Default | Type                                        |
| -------- | ----------------------------------------------------------------- | ------- | ------------------------------------------- |
| patterns | An object of patterns to check the text contents of files against | `{}`    | {\[regexCheckName:string]:string \| RegExp} |

## 4. <a name='Acknowledgements'></a>Acknowledgements

Huge thanks to [truffleHog](https://github.com/dxa4481/truffleHog) for the inspiration, the regexes, and the measure of entropy.
