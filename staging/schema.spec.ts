import assert, { AssertionError } from "node:assert";
import { describe, it } from "node:test";
import { ALL_LINTERS, FLAT_LINTERS, type ESLintClass } from "./test-linters";
import * as noSecrets from "../src/index";

type SchemaTest = {
  name: string;
  config: any;
  patterns: RegExp[];
};
const RULE_CONFIGS: SchemaTest[] = [
  {
    name: "Test some valid combinations",
    config: {
      plugins: {
        "no-secrets": noSecrets,
      },
      rules: {
        "no-secrets/no-secrets": [
          "error",
          {
            tolerance: 5,
            ignoreCase: true,
            ignoreContent: [/NOT_SECRET/],
            ignoreModules: false,
            ignoreIdentifiers: /NOT_SECRET/,
            additionalDelimiters: ".",
          },
        ],
      },
    },
    patterns: [],
  },
  {
    name: "Invalid tolerance value",
    config: {
      plugins: {
        "no-secrets": noSecrets,
      },
      rules: {
        "no-secrets/no-secrets": ["error", { tolerance: "invalid" }],
      },
    },
    patterns: [
      /Key "no-secrets\/no-secrets"/,
      /Value "invalid" should be number./,
    ],
  },
  {
    name: "Negative Tolerance",
    config: {
      plugins: {
        "no-secrets": noSecrets,
      },
      rules: {
        "no-secrets/no-secrets": ["error", { tolerance: -5 }],
      },
    },
    patterns: [/Key "no-secrets\/no-secrets/, /Value -5 should be > 0./],
  },
  {
    name: "Zero Tolerance",
    config: {
      plugins: {
        "no-secrets": noSecrets,
      },
      rules: {
        "no-secrets/no-secrets": ["error", { tolerance: 0 }],
      },
    },
    patterns: [/Key "no-secrets\/no-secrets/, /Value 0 should be > 0./],
  },
  {
    name: "Non-dictionary additionalRegexes",
    config: {
      plugins: {
        "no-secrets": noSecrets,
      },
      rules: {
        "no-secrets/no-secrets": [
          "error",
          { additionalRegexes: { x: 4, y: true } },
        ],
      },
    },
    patterns: [/Value 4 should be string./, /Value 4 should be object/],
  },
];

function schemaTests(ESLint: ESLintClass) {
  for (const test of RULE_CONFIGS) {
    it(test.name, async () => {
      const eslint = new ESLint({
        allowInlineConfig: true,
        //@ts-ignore
        overrideConfig: test.config,
        baseConfig: {},
        overrideConfigFile: true,
      });
      try {
        const results = await eslint.lintText("const dummy = 1;");
      } catch (err) {
        if (test.patterns.length === 0) {
          throw new AssertionError({
            message: "Did not expect error for test " + test.name,
          });
        } else {
          const error = err as Error;
          for (const pattern of test.patterns) {
            assert.match(error.message, pattern);
          }
        }
      }
    });
  }
}

describe("Schema Validation Tests", () => {
  for (const [version, Linter] of FLAT_LINTERS) {
    describe(`Schema Tests for ESLint ${version}`, () => {
      schemaTests(Linter);
    });
  }
});
