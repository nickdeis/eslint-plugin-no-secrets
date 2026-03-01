import type { Rule, ESLint } from "eslint10";
import {
  getIdentifierName,
  shannonEntropy,
  checkOptions,
  HIGH_ENTROPY,
  PATTERN_MATCH,
  isModulePathString,
  getSourceCode,
  CheckedNode,
} from "./utils";
import STANDARD_PATTERNS from "./regexes";
import noPatternMatch from "./no-pattern-match";
import { SimpleLiteral, Node } from "estree";
import schema from "./no-secrets.schema.json";
import type { JSONSchema4 } from "json-schema";

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
type Pattern = string | RegExp;

function shouldIgnore(value: string, toIgnore: Pattern[]) {
  for (let i = 0; i < toIgnore.length; i++) {
    if (value.match(toIgnore[i])) return true;
  }
  return false;
}

const meta: ESLint.Plugin["meta"] = {
  name: "eslint-plugin-no-secrets",
  version: "2.3.3",
};

const noSecrets: Rule.RuleModule = {
  meta: {
    schema: schema as JSONSchema4,
    messages: {
      [HIGH_ENTROPY]: `Found a string with entropy {{ entropy }} : "{{ token }}"`,
      [PATTERN_MATCH]: `Found a string that matches "{{ name }}" : "{{ match }}"`,
    },
    docs: {
      description:
        "An eslint rule that looks for possible leftover secrets in code",
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
    const sourceCode = getSourceCode(context);

    const allPatterns = { ...STANDARD_PATTERNS, ...additionalRegexes };

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

    function entropyReport(data, node: Node) {
      //Easier to read numbers
      data.entropy = Math.round(data.entropy * 100) / 100;
      context.report({
        node,
        data,
        messageId: HIGH_ENTROPY,
      });
    }

    function patternReport(data, node: Node) {
      context.report({
        node,
        data,
        messageId: PATTERN_MATCH,
      });
    }
    function checkString(value: Literal, node: CheckedNode) {
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
    const comments = sourceCode?.getAllComments?.() || [];
    comments.forEach((comment) =>
      checkString(comment.value, comment as unknown as CheckedNode),
    );

    return {
      /**
       * For the official eslint json plugin
       */
      String(node: SimpleLiteral & Rule.NodeParentExtension) {
        const { value } = node;
        checkString(value, node);
      },
      Literal(node) {
        const { value } = node;
        checkString(value, node);
      },
      TemplateElement(node) {
        if (!node.value) return;
        const value = node.value.cooked;
        checkString(value, node);
      },
      JSONLiteral(node: SimpleLiteral & Rule.NodeParentExtension) {
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
