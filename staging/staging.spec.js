const path = require("path");

const ESLint7 = require("eslint").ESLint;
const ESLint9 = require("eslint9").ESLint;
const ESLint8 = require("eslint8").ESLint;
const ESLint10 = require("eslint10").ESLint;
const assert = require("assert");
const { describe, it } = require("node:test");

const JSON_FILES = [
  {
    name: "Should not detect non-secrets",
    file: "./staging/has-no-secret.json",
    errorCount: 0,
  },
  {
    name: "Should detect secrets in json files",
    file: "./staging/has-secret.json",
    errorCount: 2,
  },
];

const JS_FILES = [
  {
    name: "Should not detect non-secrets",
    file: "./staging/has-no-secret.js",
    errorCount: 0,
  },
  {
    name: "Should detect secrets in json files",
    file: "./staging/has-secret.js",
    errorCount: 2,
  },
];

const TESTS = {
  "jsonc.eslintrc.js": JSON_FILES,
  "normal.eslintrc.js": JS_FILES,
  "mixed.eslintrc.js": [].concat(JSON_FILES).concat(JS_FILES),
};

/**
 * JSONC plugin has not been updated to be compat with ESLint 10
 */
const ESLINT_10_TESTS = {
  "normal-flat.eslintrc.js": JS_FILES,
  "json-flat.eslintrc.js": JSON_FILES,
};

const FLAT_TESTS = {
  ...ESLINT_10_TESTS,
  "mixed-flat.eslintrc.js": [].concat(JSON_FILES).concat(JS_FILES),
  "jsonc-flat.eslintrc.js": JSON_FILES,
};

async function runTests(tests, eslintClazz) {
  const configs = Object.entries(tests);
  for (const [config, tests] of configs) {
    const eslint = new eslintClazz({
      overrideConfigFile: path.join(__dirname, config),
    });
    const files = tests.map((test) => test.file);
    console.log(config);
    const results = await eslint.lintFiles(files);

    describe(config, () => {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const report = results[i];
        it(test.name, () => {
          assert.strictEqual(
            test.errorCount,
            report.errorCount,
            JSON.stringify(report.messages, null, 2),
          );
        });
      }
    });
  }
}
const LEGACY_LINTERS = [
  [7, ESLint7],
  [8, ESLint8],
];
describe("Staging tests", async () => {
  describe("JSON compat testing", async () => {
    for (const [version, Linter] of LEGACY_LINTERS) {
      describe(`Staging Tests for ESLint ${version}`, async () => {
        await runTests(TESTS, Linter);
      });
    }
  });

  describe("Flat config testing for ESLint 9", async () => {
    await runTests(FLAT_TESTS, ESLint9);
  });
  describe("ESLint 10 Tests", async () => {
    await runTests(ESLINT_10_TESTS, ESLint10);
  });
});
