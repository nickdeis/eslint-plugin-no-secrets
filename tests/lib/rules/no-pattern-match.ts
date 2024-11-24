import { rules } from "../../../src/index";
import RULE_TESTERS from "./rule-testers";
const noPatternMatch = rules["no-pattern-match"];

const FULL_TEXT = `
/**SECRET**/
const VAULT = {
  token:"secret secret SECRET"
};
`;

function createTests(_flatConfig = false) {
  return {
    valid: [
      {
        code: FULL_TEXT,
        options: [
          {
            additionalPatterns: {
              Test: /secret/i,
              MultiLine: /VAULT = {[\n.\s\t]*to/im,
            },
          },
        ],
      },
    ],
    invalid: [],
  };
}

RULE_TESTERS.forEach(([version, ruleTester]) => {
  ruleTester.run("no-pattern-match", noPatternMatch, createTests(9 <= version));
});
