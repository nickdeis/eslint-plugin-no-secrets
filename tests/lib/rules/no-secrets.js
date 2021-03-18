const RuleTester6 = require("eslint6").RuleTester,
RuleTester7 = require("eslint").RuleTester,
  rule = require("../../..").rules["no-secrets"],
  { HIGH_ENTROPY, PATTERN_MATCH } = require("../../../utils"),
  P = require("../../../regexes"),
  _ = require("lodash");

const RULE_TESTER_CONFIG = { env: { es6: true } }

const ruleTester6 = new RuleTester6(RULE_TESTER_CONFIG);
const ruleTester7 = new RuleTester7(RULE_TESTER_CONFIG);
const RULE_TESTERS = [ruleTester6,ruleTester7];

const STRING_TEST = `
const NOT_A_SECRET = "I'm not a secret, I think";
`;

const IMPORT_REQUIRE_TEST = `
const webpackFriendlyConsole = require('./config/webpack/webpackFriendlyConsole')
`;

const TEMPLATE_TEST = "const NOT_A_SECRET = `A template that isn't a secret. ${1+1} = 2`";

const SECRET_STRING_TEST = `
const A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
`;

const SECRET_LOWERCASE_STRING = `
const A_LOWERCASE_SECRET = "zwvtjpqsdhwrgl204hc51ycsritmizn8b=/p9uyex7xu6kkagqfm3fj+oobldneva";
`;

const A_BEARER_TOKEN = `
const A_BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAMLheAAAAAAA0%2BuSeid%2BULvsea4JtiGRiSDSJSI%3DEUifiRBkKG5E2XzMDjRfl76ZC9Ub0wnz4XsNiRVBChTYbJcE3F";
`;

const IN_AN_OBJECT = `
const VAULT = {
  token:"baaaaaaaaaaaaaaaaaaaamlheaaaaaaa0%2buseid%2bulvsea4jtigrisdsjsi%3deuifirbkkg5e2xzmdjrfl76zc9ub0wnz4xsnirvbchtybjce3f"
}
`;

const CSS_CLASSNAME = `
const CSS_CLASSNAME = "hey-it-s-a-css-class-not-a-secret and-neither-this-one";
`;

const PROPERTY_NAME = `
const VAULT = {
  "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva": "not a secret"
}
`;

const IGNORE_CONTENT_TEST = `
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
`;

const IMPORT_TEST = `
import {x} from "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
`;

const IGNORE_VAR_TEST = `const NOT_A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";`;

const IGNORE_FIELD_TEST = `
const VAULT = {
  NOT_A_SECRET:"ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva"
};

`;

const IGNORE_CLASS_FIELD_TEST = `
class A {
  constructor(){
    this.secret = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
  }
}
`;

const IS_REALLY_A_NAMESPACE_TEST = `
const NAMESPACE_CLASSNAME = 'Validation.JSONSchemaValidationUtilsImplFactory';
`;

const COMMENTS_TEST = `
// const password = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
const password = "";
`;
/**
 * Test to make sure regular expressions aren't triggered by the entropy check
 */
const REGEX_TESTS = [
  P["Slack Token"],
  P["AWS API Key"],
  P["Facebook Oauth"],
  P["Twitter Oauth"],
  P["Password in URL"]
].map(regexp => ({ code: `const REGEXP = \`${regexp.source}\``, options: [] }));

const HIGH_ENTROPY_MSG = {
  messageId: HIGH_ENTROPY
};
const PATTERN_MATCH_MSG = {
  messageId: PATTERN_MATCH
};

const PATTERN_MATCH_TESTS = [P["Google (GCP) Service-account"], P["RSA private key"]].map(regexp => ({
  code: `const REGEXP = \`${regexp.source}\``,
  options: [],
  errors: [PATTERN_MATCH_MSG]
}));

const TESTS = {
  valid: [
    {
      code: STRING_TEST,
      options: []
    },
    {
      code: TEMPLATE_TEST,
      options: []
    },
    {
      code: IMPORT_REQUIRE_TEST,
      options: []
    },
    {
      code: CSS_CLASSNAME,
      options: []
    },
    {
      code: PROPERTY_NAME,
      options: []
    },
    {
      code: IGNORE_CONTENT_TEST,
      options: [{ ignoreContent: [/^ABC/] }]
    },
    {
      code: IGNORE_CONTENT_TEST,
      options: [{ ignoreContent: "^ABC" }]
    },
    {
      //Property
      code: IGNORE_FIELD_TEST,
      options: [{ ignoreIdentifiers:[/NOT_A_SECRET/] }]
    },
    {
      code: IMPORT_TEST,
      options: [{ ignoreModules: true }],
      parserOptions: { sourceType: "module", ecmaVersion: 7 }
    },
    {
      //VariableDeclarator
      code: IGNORE_VAR_TEST,
      options: [{ignoreIdentifiers:"NOT_A_SECRET"}]
    },
    {
      code:IS_REALLY_A_NAMESPACE_TEST,
      options: [{additionalDelimiters:["."]}]
    },
    {
      code:IS_REALLY_A_NAMESPACE_TEST,
      options: [{ignoreCase:true}]
    }
  ].concat(REGEX_TESTS),
  invalid: [
    {
      code: SECRET_STRING_TEST,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: A_BEARER_TOKEN,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: IN_AN_OBJECT,
      options: [],
      errors: [HIGH_ENTROPY_MSG]
    },
    {
      code: `
        const BASIC_AUTH_HEADER =  "Authorization: Basic QWxhZGRpbjpPcGVuU2VzYW1l"
      `,
      options: [{ additionalRegexes: { "Basic Auth": "Authorization: Basic [A-Za-z0-9+/=]*" } }],
      errors: [HIGH_ENTROPY_MSG, PATTERN_MATCH_MSG]
    },
    {
      code:SECRET_LOWERCASE_STRING,
      errors:[HIGH_ENTROPY_MSG]
    },
    {
      code: COMMENTS_TEST,
      errors:[HIGH_ENTROPY_MSG]
    }
  ].concat(PATTERN_MATCH_TESTS)
};


RULE_TESTERS.forEach(ruleTester => {
  ruleTester.run("no-secrets", rule, TESTS);
});
