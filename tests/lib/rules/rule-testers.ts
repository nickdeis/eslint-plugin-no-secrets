import { RuleTester as RuleTester6 } from "eslint6";
import { RuleTester as RuleTester7 } from "eslint";
import { RuleTester as RuleTester9 } from "eslint9";
import { RuleTester as RuleTester8 } from "eslint8";

const RULE_TESTER_CONFIG = { env: { es6: true } };

const ruleTester6 = new RuleTester6(RULE_TESTER_CONFIG);
//@ts-ignore
const ruleTester7 = new RuleTester7(RULE_TESTER_CONFIG);
const ruleTester8 = new RuleTester8(RULE_TESTER_CONFIG);
const ruleTester9 = new RuleTester9({ languageOptions: { ecmaVersion: 6 } });
const RULE_TESTERS = [
  [6, ruleTester6],
  [7, ruleTester7],
  [8, ruleTester8],
  [9, ruleTester9],
];

export default RULE_TESTERS;
