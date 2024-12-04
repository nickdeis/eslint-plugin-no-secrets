import type { Rule, ESLint } from "eslint";
import {
  getIdentifierName,
  shannonEntropy,
  checkOptions,
  HIGH_ENTROPY,
  PATTERN_MATCH,
  isModulePathString,
} from "./utils";
import STANDARD_PATTERNS from "./regexes";
import noPatternMatch from "./no-pattern-match";

type Literal = string | number | bigint | boolean | RegExp;

function isNonEmptyString(value: Literal): value is string {
  return !!(value && typeof value === "string");
}

function checkRegexes(value: string, patterns: Record<string, RegExp>) {
  return Object.keys(patterns)
    .map((name) => {
      const pattern = patterns[name];
      const m = value.match(pattern);
      if (!m || !m[0]) return m;
      return { name, match: m[0] };
    })
    .filter((payload) => !!payload);
}

function shouldIgnore(value: string, toIgnore) {
  for (let i = 0; i < toIgnore.length; i++) {
    if (value.match(toIgnore[i])) return true;
  }
  return false;
}

const meta: ESLint.Plugin["meta"] = {
  name: "eslint-plugin-no-secrets",
  version: "2.1.1",
};

const noSecrets: Rule.RuleModule = {
  meta: {
    schema: false,
    messages: {
      [HIGH_ENTROPY]: `Found a string with entropy {{ entropy }} : "{{ token }}"`,
      [PATTERN_MATCH]: `Found a string that matches "{{ name }}" : "{{ match }}"`,
    },
    docs: {
      description:
        "An eslint rule that looks for possible leftover secrets in code",
      category: "Best Practices",
    },
  },
  create(context) {
    const {
      tolerance,
      additionalRegexes,
      ignoreContent,
      ignoreModules,
      ignoreIdentifiers,
      additionalDelimiters,
      ignoreCase,
    } = checkOptions(context.options[0] || {});
    const sourceCode = context.getSourceCode() || context.sourceCode;

    const allPatterns = Object.assign({}, STANDARD_PATTERNS, additionalRegexes);

    const allDelimiters: (string | RegExp)[] = (
      additionalDelimiters as (string | RegExp)[]
    ).concat([" "]);

    function splitIntoTokens(value: string) {
      let tokens = [value];
      allDelimiters.forEach((delimiter) => {
        //@ts-ignore
        tokens = tokens.map((token) => token.split(delimiter));
        //flatten
        tokens = [].concat.apply([], tokens);
      });
      return tokens;
    }

    function checkEntropy(value: string) {
      value = ignoreCase ? value.toLowerCase() : value;
      const tokens = splitIntoTokens(value);
      return tokens
        .map((token) => {
          const entropy = shannonEntropy(token);
          return { token, entropy };
        })
        .filter((payload) => tolerance <= payload.entropy);
    }

    function entropyReport(data, node) {
      //Easier to read numbers
      data.entropy = Math.round(data.entropy * 100) / 100;
      context.report({
        node,
        data,
        messageId: HIGH_ENTROPY,
      });
    }

    function patternReport(data, node) {
      context.report({
        node,
        data,
        messageId: PATTERN_MATCH,
      });
    }
    function checkString(value: Literal, node) {
      const idName = getIdentifierName(node);
      if (idName && shouldIgnore(idName, ignoreIdentifiers)) return;
      if (!isNonEmptyString(value)) return;
      if (ignoreModules && isModulePathString(node)) {
        return;
      }
      if (shouldIgnore(value, ignoreContent)) return;
      checkEntropy(value).forEach((payload) => {
        entropyReport(payload, node);
      });
      checkRegexes(value, allPatterns).forEach((payload) => {
        patternReport(payload, node);
      });
    }

    //Check all comments
    const comments = sourceCode.getAllComments();
    comments.forEach((comment) => checkString(comment.value, comment));

    return {
      Literal(node) {
        const { value } = node;
        checkString(value, node);
      },
      TemplateElement(node) {
        if (!node.value) return;
        const value = node.value.cooked;
        checkString(value, node);
      },
      JSONLiteral(node) {
        const { value } = node;
        checkString(value, node);
      },
    };
  },
};

const rules = {
  "no-pattern-match": noPatternMatch,
  "no-secrets": noSecrets,
};

export { meta, rules };
