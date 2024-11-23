import type { Rule } from "eslint";
import {
  DEFAULT_ADDTIONAL_REGEXES,
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

function parseAndValidateOptions({ additionalPatterns }) {
  const compiledRegexes = validateRecordOfRegex(
    plainObjectOption(
      additionalPatterns,
      "additionalPatterns",
      DEFAULT_ADDTIONAL_REGEXES
    )
  );
  return {
    additionalPatterns: compiledRegexes,
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

function findLineAndColNoFromMatchIdx(
  idx: number,
  linesIdx: number[],
  matchLength: number
) {
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

type MatchInstance = { pattern: string | RegExp; multiline?: boolean };

type MatchInstanceRaw = string | RegExp | MatchInstance;

function multiLinePatternMatch() {}

const noPatternMatch: Rule.RuleModule = {
  meta: {
    schema: false,
    docs: {
      description:
        "An eslint rule that does pattern matching against an entire file",
      category: "Best Practices",
    },
  },
  create(context) {
    const { additionalPatterns } = parseAndValidateOptions(
      context.options[0] || {}
    );
    const sourceCode = context?.getSourceCode?.() || context.sourceCode;
    const patterns = Object.entries(additionalPatterns);
    const text = sourceCode.text;
    const newLinePos = findAllNewLines(text);

    for (const [name, pattern] of patterns) {
      const globalPattern = globalizeRegularExpression(pattern);
      const matches = Array.from(text.matchAll(globalPattern));
      for (const m of matches) {
        const idx = m.index;
        const match = m[0];
        const meta = findLineAndColNoFromMatchIdx(
          idx,
          newLinePos,
          match.length
        );
        //console.log({ match, meta });
      }
    }

    return {};
  },
};

export default noPatternMatch;
