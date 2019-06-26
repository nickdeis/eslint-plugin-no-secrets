const {
  getIdentifierName,
  shannonEntropy,
  checkOptions,
  HIGH_ENTROPY,
  PATTERN_MATCH,
  isModulePathString
} = require("./utils");
const STANDARD_PATTERNS = require("./regexes");

function isNonEmptyString(value) {
  return value && typeof value === "string";
}

function checkEntropy(value, tolerance) {
  const tokens = value.split(" ");
  return tokens
    .map(token => {
      const entropy = shannonEntropy(token);
      return { token, entropy };
    })
    .filter(payload => tolerance <= payload.entropy);
}

function checkRegexes(value, patterns) {
  return Object.keys(patterns)
    .map(name => {
      const pattern = patterns[name];
      const m = value.match(pattern);
      if (!m || !m[0]) return m;
      return { name, match: m[0] };
    })
    .filter(payload => !!payload);
}

function shouldIgnore(value,toIgnore) {
  for (let i = 0; i < toIgnore.length; i++) {
    if (value.match(toIgnore[i])) return true;
  }
  return false;
}

module.exports = {
  rules: {
    "no-secrets": {
      meta: {
        messages: {
          [HIGH_ENTROPY]: `Found a string with entropy {{ entropy }} : "{{ token }}"`,
          [PATTERN_MATCH]: `Found a string that matches "{{ name }}" : "{{ match }}"`
        },
        docs: {
          description: "An eslint rule that looks for possible leftover secrets in code",
          category: "Best Practices"
        }
      },
      create(context) {
        const { tolerance, additionalRegexes, ignoreContent, ignoreModules,ignoreIdentifiers } = checkOptions(context.options[0] || {});
        const sourceCode = context.getSourceCode();
        const comments = sourceCode.getAllComments();
        const allPatterns = Object.assign({}, STANDARD_PATTERNS, additionalRegexes);
        function entropyReport(data, node) {
          //Easier to read numbers
          data.entropy = Math.round(data.entropy * 100) / 100;
          context.report({
            node,
            data,
            messageId: HIGH_ENTROPY
          });
        }

        function patternReport(data, node) {
          context.report({
            node,
            data,
            messageId: PATTERN_MATCH
          });
        }
        function checkString(value, node) {
          const idName = getIdentifierName(node);
          if (idName && shouldIgnore(idName,ignoreIdentifiers)) return;
          if (!isNonEmptyString(value)) return;
          if (ignoreModules && isModulePathString(node)) {
            return;
          }
          if (shouldIgnore(value,ignoreContent)) return;
          checkEntropy(value, tolerance).forEach(payload => {
            entropyReport(payload, node);
          });
          checkRegexes(value, allPatterns).forEach(payload => {
            patternReport(payload, node);
          });
        }

        return {
          Literal(node) {
            const { value } = node;
            checkString(value, node);
          },
          TemplateElement(node) {
            if (!node.value) return;
            const value = node.value.cooked;
            checkString(value, node);
          }
        };
      }
    }
  }
};
