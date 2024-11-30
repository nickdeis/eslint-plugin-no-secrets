import { rules } from "../../../src/index";
import { FULL_TEXT_MATCH } from "../../../src/utils";
import RULE_TESTERS from "./rule-testers";
const noPatternMatch = rules["no-pattern-match"];

const FULL_TEXT_NO_SECRETS = `
/**Not a problem**/
const A = "Not a problem";
`;

const FULL_TEXT_SECRETS = `
/**SECRET**/
const VAULT = {
  token:"secret secret SECRET"
};
`;

const patterns = {
  Test: /secret/i,
  MultiLine: /VAULT = {[\n.\s\t]*to/im,
};

const FULL_TEXT_MATCH_MSG = {
  messageId: FULL_TEXT_MATCH,
};

function createTests(_flatConfig = false) {
  return {
    valid: [
      {
        code: FULL_TEXT_NO_SECRETS,
        options: [
          {
            patterns,
          },
        ],
      },
    ],
    invalid: [
      {
        code: FULL_TEXT_SECRETS,
        options: [
          {
            patterns,
          },
        ],
        errors: Array(5).fill(FULL_TEXT_MATCH_MSG),
      },
    ],
  };
}

RULE_TESTERS.forEach(([version, ruleTester]) => {
  ruleTester.run("no-pattern-match", noPatternMatch, createTests(9 <= version));
});
