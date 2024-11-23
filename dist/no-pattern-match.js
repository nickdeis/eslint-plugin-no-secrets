"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
/**
 * Adds a global flag to a regular expression, useful for using matchAll or just doing multiple matches
 * @param regexp
 * @returns
 */
function globalizeRegularExpression(regexp) {
    if (regexp.global)
        return regexp;
    return new RegExp(regexp, regexp.flags + "g");
}
function globalizeAllRegularExps(patterns) {
    return Object.fromEntries(Object.entries(patterns).map(([name, pattern]) => [
        name,
        globalizeRegularExpression(pattern),
    ]));
}
function parseAndValidateOptions({ additionalPatterns }) {
    const compiledRegexes = (0, utils_1.validateRecordOfRegex)((0, utils_1.plainObjectOption)(additionalPatterns, "additionalPatterns", utils_1.DEFAULT_ADDTIONAL_REGEXES));
    return {
        additionalPatterns: compiledRegexes,
    };
}
function findAllNewLines(text) {
    let pos = 0;
    const posistions = [];
    while (pos !== -1) {
        const nextpos = text.indexOf("\n", pos);
        if (nextpos === -1)
            break;
        if (nextpos === pos)
            pos++;
        posistions.push(nextpos);
        pos = nextpos + 1;
    }
    return posistions;
}
function findLineAndColNoFromMatchIdx(idx, linesIdx, matchLength) {
    for (let i = 0; i < linesIdx.length; i++) {
        const lnIdx = linesIdx[i];
        if (idx <= lnIdx) {
            const lineNo = i + 1;
            const endCol = lnIdx - idx + 1;
            const startCol = endCol - matchLength;
            return {
                startCol,
                lineNo,
                endCol,
            };
        }
    }
}
function multiLinePatternMatch() { }
const noPatternMatch = {
    meta: {
        schema: false,
        docs: {
            description: "An eslint rule that does pattern matching against an entire file",
            category: "Best Practices",
        },
    },
    create(context) {
        var _a;
        const { additionalPatterns } = parseAndValidateOptions(context.options[0] || {});
        const sourceCode = ((_a = context === null || context === void 0 ? void 0 : context.getSourceCode) === null || _a === void 0 ? void 0 : _a.call(context)) || context.sourceCode;
        const patterns = Object.entries(additionalPatterns);
        const text = sourceCode.text;
        const newLinePos = findAllNewLines(text);
        for (const [name, pattern] of patterns) {
            const globalPattern = globalizeRegularExpression(pattern);
            const matches = Array.from(text.matchAll(globalPattern));
            for (const m of matches) {
                const idx = m.index;
                const match = m[0];
                const meta = findLineAndColNoFromMatchIdx(idx, newLinePos, match.length);
                //console.log({ match, meta });
            }
        }
        return {};
    },
};
exports.default = noPatternMatch;
