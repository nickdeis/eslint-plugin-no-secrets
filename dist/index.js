"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rules = exports.meta = void 0;
const utils_1 = require("./utils");
const regexes_1 = __importDefault(require("./regexes"));
const no_pattern_match_1 = __importDefault(require("./no-pattern-match"));
function isNonEmptyString(value) {
    return !!(value && typeof value === "string");
}
function checkRegexes(value, patterns) {
    return Object.keys(patterns)
        .map((name) => {
        const pattern = patterns[name];
        const m = value.match(pattern);
        if (!m || !m[0])
            return m;
        return { name, match: m[0] };
    })
        .filter((payload) => !!payload);
}
function shouldIgnore(value, toIgnore) {
    for (let i = 0; i < toIgnore.length; i++) {
        if (value.match(toIgnore[i]))
            return true;
    }
    return false;
}
const meta = {
    name: "eslint-plugin-no-secrets",
    version: "1.0.0-eslint9",
};
exports.meta = meta;
const noSecrets = {
    meta: {
        schema: false,
        messages: {
            [utils_1.HIGH_ENTROPY]: `Found a string with entropy {{ entropy }} : "{{ token }}"`,
            [utils_1.PATTERN_MATCH]: `Found a string that matches "{{ name }}" : "{{ match }}"`,
        },
        docs: {
            description: "An eslint rule that looks for possible leftover secrets in code",
            category: "Best Practices",
        },
    },
    create(context) {
        const { tolerance, additionalRegexes, ignoreContent, ignoreModules, ignoreIdentifiers, additionalDelimiters, ignoreCase, } = (0, utils_1.checkOptions)(context.options[0] || {});
        const sourceCode = context.getSourceCode() || context.sourceCode;
        const allPatterns = Object.assign({}, regexes_1.default, additionalRegexes);
        const allDelimiters = additionalDelimiters.concat([" "]);
        function splitIntoTokens(value) {
            let tokens = [value];
            allDelimiters.forEach((delimiter) => {
                //@ts-ignore
                tokens = tokens.map((token) => token.split(delimiter));
                //flatten
                tokens = [].concat.apply([], tokens);
            });
            return tokens;
        }
        function checkEntropy(value) {
            value = ignoreCase ? value.toLowerCase() : value;
            const tokens = splitIntoTokens(value);
            return tokens
                .map((token) => {
                const entropy = (0, utils_1.shannonEntropy)(token);
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
                messageId: utils_1.HIGH_ENTROPY,
            });
        }
        function patternReport(data, node) {
            context.report({
                node,
                data,
                messageId: utils_1.PATTERN_MATCH,
            });
        }
        function checkString(value, node) {
            const idName = (0, utils_1.getIdentifierName)(node);
            if (idName && shouldIgnore(idName, ignoreIdentifiers))
                return;
            if (!isNonEmptyString(value))
                return;
            if (ignoreModules && (0, utils_1.isModulePathString)(node)) {
                return;
            }
            if (shouldIgnore(value, ignoreContent))
                return;
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
                if (!node.value)
                    return;
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
    "no-pattern-match": no_pattern_match_1.default,
    "no-secrets": noSecrets,
};
exports.rules = rules;
