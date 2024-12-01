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
function parseAndValidateOptions({ patterns }) {
    const compiledRegexes = (0, utils_1.validateRecordOfRegex)((0, utils_1.plainObjectOption)(patterns, "patterns", utils_1.DEFAULT_ADDTIONAL_REGEXES));
    return {
        patterns: compiledRegexes,
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
function findLineAndColNoFromMatchIdx(startIdx, linesIdx, matchLength) {
    const endIdx = startIdx + matchLength;
    const lineSelections = [];
    for (let i = 0; i < linesIdx.length; i++) {
        const lnIdx = linesIdx[i];
        const lineNo = i + 1;
        if (startIdx <= lnIdx && (linesIdx[i - 1] || 0) <= startIdx) {
            //Last line
            if (endIdx <= lnIdx) {
                const endCol = endIdx - linesIdx[i - 1];
                let startCol = endCol - matchLength;
                if (startCol < 0) {
                    startCol = 0;
                }
                lineSelections.push({ lineNo, endCol, startCol });
                return { endIdx, startIdx, lineSelections };
            }
            else {
                //not last line
                const endCol = lnIdx - linesIdx[i - 1];
                let startCol = endCol - (lnIdx - startIdx);
                if (startCol < 0) {
                    startCol = 0;
                }
                lineSelections.push({ lineNo, endCol, startCol });
            }
        }
        if (endIdx <= lnIdx) {
            const endCol = endIdx - linesIdx[i - 1];
            let startCol = endCol - matchLength;
            if (startCol < 0) {
                startCol = 0;
            }
            lineSelections.push({ lineNo, endCol, startCol });
            return { endIdx, startIdx, lineSelections };
        }
    }
    return { endIdx, startIdx, lineSelections };
}
function serializeTextSelections(textAreaSelection) {
    return textAreaSelection.lineSelections
        .map((line) => {
        return `${line.lineNo}:${line.startCol}-${line.endCol}`;
    })
        .join(",");
}
function findStartAndEndTextSelection(textAreaSelection) {
    const start = {
        column: Infinity,
        line: Infinity,
    };
    const end = {
        line: 0,
        column: 0,
    };
    for (const line of textAreaSelection.lineSelections) {
        const min = Math.min(line.lineNo, start.line);
        if (line.lineNo === min) {
            start.line = min;
            start.column = line.startCol;
        }
        const max = Math.max(line.lineNo, end.line);
        if (line.lineNo === max) {
            end.line = max;
            end.column = line.endCol;
        }
    }
    return {
        start,
        end,
    };
}
const FULL_TEXT_MATCH_MESSAGE = `Found text that matches the pattern "{{ patternName }}": {{ textMatch }}`;
const noPatternMatch = {
    meta: {
        schema: false,
        messages: {
            [utils_1.FULL_TEXT_MATCH]: FULL_TEXT_MATCH_MESSAGE,
        },
        docs: {
            description: "An eslint rule that does pattern matching against an entire file",
            category: "Best Practices",
        },
    },
    create(context) {
        var _a;
        const { patterns } = parseAndValidateOptions(context.options[0] || {});
        const sourceCode = ((_a = context === null || context === void 0 ? void 0 : context.getSourceCode) === null || _a === void 0 ? void 0 : _a.call(context)) || context.sourceCode;
        const patternList = Object.entries(patterns);
        const text = sourceCode.text;
        const newLinePos = findAllNewLines(text);
        const matches = patternList
            .map(([name, pattern]) => {
            const globalPattern = globalizeRegularExpression(pattern);
            const matches = Array.from(text.matchAll(globalPattern));
            return matches.map((m) => {
                const idx = m.index;
                const textMatch = m[0];
                const lineAndColNumbers = findLineAndColNoFromMatchIdx(idx, newLinePos, textMatch.length);
                return { lineAndColNumbers, textMatch, patternName: name };
            });
        })
            .flat();
        matches.forEach(({ patternName, textMatch, lineAndColNumbers }) => {
            context.report({
                data: { patternName, textMatch },
                messageId: utils_1.FULL_TEXT_MATCH,
                loc: findStartAndEndTextSelection(lineAndColNumbers),
            });
        });
        return {};
    },
};
exports.default = noPatternMatch;
