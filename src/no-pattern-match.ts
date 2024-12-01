import type { Rule } from "eslint";
import {
  DEFAULT_ADDTIONAL_REGEXES,
  FULL_TEXT_MATCH,
  plainObjectOption,
  validateRecordOfRegex,
} from "./utils";

/**
 * Adds a global flag to a regular expression, useful for using matchAll or just doing multiple matches
 * @param regexp
 * @returns
 */
function globalizeRegularExpression(regexp: RegExp) {
  if (regexp.global) return regexp;
  return new RegExp(regexp, regexp.flags + "g");
}

function globalizeAllRegularExps(
  patterns: Record<string, RegExp>
): Record<string, RegExp> {
  return Object.fromEntries(
    Object.entries(patterns).map(([name, pattern]) => [
      name,
      globalizeRegularExpression(pattern),
    ])
  );
}

function parseAndValidateOptions({ patterns }) {
  const compiledRegexes = validateRecordOfRegex(
    plainObjectOption(patterns, "patterns", DEFAULT_ADDTIONAL_REGEXES)
  );
  return {
    patterns: compiledRegexes,
  };
}

function findAllNewLines(text: string) {
  let pos = 0;
  const posistions: number[] = [];
  while (pos !== -1) {
    const nextpos = text.indexOf("\n", pos);
    if (nextpos === -1) break;
    if (nextpos === pos) pos++;
    posistions.push(nextpos);
    pos = nextpos + 1;
  }
  return posistions;
}

type LineTextArea = {
  lineNo: number;
  startCol: number;
  endCol: number;
};

type TextAreaSelection = {
  startIdx: number;
  endIdx: number;
  lineSelections: LineTextArea[];
};

function findLineAndColNoFromMatchIdx(
  startIdx: number,
  linesIdx: number[],
  matchLength: number
): TextAreaSelection {
  const endIdx = startIdx + matchLength;
  const lineSelections: LineTextArea[] = [];
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
      } else {
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

function serializeTextSelections(textAreaSelection: TextAreaSelection) {
  return textAreaSelection.lineSelections
    .map((line) => {
      return `${line.lineNo}:${line.startCol}-${line.endCol}`;
    })
    .join(",");
}

function findStartAndEndTextSelection(textAreaSelection: TextAreaSelection) {
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

const noPatternMatch: Rule.RuleModule = {
  meta: {
    schema: false,
    messages: {
      [FULL_TEXT_MATCH]: FULL_TEXT_MATCH_MESSAGE,
    },
    docs: {
      description:
        "An eslint rule that does pattern matching against an entire file",
      category: "Best Practices",
    },
  },
  create(context) {
    const { patterns } = parseAndValidateOptions(context.options[0] || {});
    const sourceCode = context?.getSourceCode?.() || context.sourceCode;
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
          const lineAndColNumbers = findLineAndColNoFromMatchIdx(
            idx,
            newLinePos,
            textMatch.length
          );

          return { lineAndColNumbers, textMatch, patternName: name };
        });
      })
      .flat();
    matches.forEach(({ patternName, textMatch, lineAndColNumbers }) => {
      context.report({
        data: { patternName, textMatch },
        messageId: FULL_TEXT_MATCH,
        loc: findStartAndEndTextSelection(lineAndColNumbers),
      });
    });
    return {};
  },
};

export default noPatternMatch;
