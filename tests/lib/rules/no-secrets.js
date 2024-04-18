const RuleTester6 = require("eslint6").RuleTester,
RuleTester7 = require("eslint").RuleTester,
RuleTester9 = require("eslint9").RuleTester,
RuleTester8 = require("eslint8").RuleTester,
  rule = require("../../..").rules["no-secrets"],
  {createTests} = require("./create-tests")

const RULE_TESTER_CONFIG = { env: { es6: true } }

const ruleTester6 = new RuleTester6(RULE_TESTER_CONFIG);
const ruleTester7 = new RuleTester7(RULE_TESTER_CONFIG);
const ruleTester8 = new RuleTester8(RULE_TESTER_CONFIG);
const ruleTester9 = new RuleTester9({languageOptions: { ecmaVersion: 6 }});
const RULE_TESTERS = [
  [6,ruleTester6],
  [7,ruleTester7],
  [8,ruleTester8],
  [9,ruleTester9]
];



RULE_TESTERS.forEach(([version,ruleTester]) => {

  ruleTester.run("no-secrets", rule, createTests( 9 <= version ));
});
