const MATH_LOG_2 = Math.log(2);
/**
 * Charset especially designed to ignore common regular expressions (eg [] and {}), imports/requires (/.), and css classes (-), and other special characters, 
 * which raise a lot of false postives and aren't usually in passwords/secrets
 */
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=!|*^@~`$%+?\"'_<>".split("");
const DEFAULT_TOLERANCE = 4;
const DEFAULT_ADDTIONAL_REGEXES = {};

function isPlainObject(obj) {
  return typeof obj === "object" && obj.constructor === Object;
}

function checkOptions({ tolerance, additionalRegexes, ignoreContent, ignoreModules }) {
  ignoreModules = ignoreModules || true;
  if (typeof ignoreModules !== "boolean") {
    throw new Error("The option 'ignoreModules' must be boolean");
  }
  tolerance = tolerance || DEFAULT_TOLERANCE;
  if (typeof tolerance !== "number" || tolerance <= 0) {
    throw new Error("The option tolerance must be a postive (eg greater than zero) number");
  }
  additionalRegexes = additionalRegexes || DEFAULT_ADDTIONAL_REGEXES;
  if (!isPlainObject(additionalRegexes)) {
    throw new Error("Expected additionalRegexes to be a plain object");
  }

  const compiledRegexes = {};
  for (const regexName in additionalRegexes) {
    if (additionalRegexes.hasOwnProperty(regexName)) {
      try {
        compiledRegexes[regexName] =
          additionalRegexes[regexName] instanceof RegExp
            ? additionalRegexes[regexName]
            : new RegExp(String(additionalRegexes[regexName]));
      } catch (e) {
        throw new Error(
          "Could not compile the regexp " + regexName + " with the value " + additionalRegexes[regexName]
        );
      }
    }
  }

  ignoreContent = ignoreContent || [];

  if (!Array.isArray(ignoreContent)) {
    if (typeof ignoreContent === "string" || ignoreContent instanceof RegExp) {
      ignoreContent = [ignoreContent];
    } else {
      throw new Error("Expected 'ignoreContent' to be an a array, a string, or a RegExp");
    }
  }

  const compiledIgnoreContent = [];
  for (let i = 0; i < ignoreContent.length; i++) {
    try {
      compiledIgnoreContent[i] =
        ignoreContent[i] instanceof RegExp ? ignoreContent[i] : new RegExp(String(ignoreContent[i]));
    } catch (e) {
      throw new Error("Failed to compiled the regexp " + ignoreContent[i]);
    }
  }
  return { tolerance, additionalRegexes: compiledRegexes, ignoreContent: compiledIgnoreContent, ignoreModules };
}

/**
 * From https://github.com/dxa4481/truffleHog/blob/dev/truffleHog/truffleHog.py#L85
 * @param {*} str 
 */
function shannonEntropy(str) {
  if (!str) return 0;
  let entropy = 0;
  const len = str.length;
  for (let i = 0; i < CHARSET.length; ++i) {
    //apparently this is the fastest way to char count in js
    const ratio = (str.split(CHARSET[i]).length - 1) / len;
    if (ratio > 0) entropy += -(ratio * (Math.log(ratio) / MATH_LOG_2));
  }
  return entropy;
}

const MODULE_FUNCTIONS = ["import", "require"];

/**
 * Used to detect "import()" and "require()"
 * Inspired by https://github.com/benmosher/eslint-plugin-import/blob/45bfe472f38ef790c11efe45ffc59808c67a3f94/src/core/staticRequire.js
 * @param {*} node 
 */
function isStaticImportOrRequire(node) {
  return (
    node &&
    node.callee &&
    node.callee.type === "Identifier" &&
    MODULE_FUNCTIONS.indexOf(node.callee.name) !== -1 &&
    node.arguments.length === 1 &&
    node.arguments[0].type === "Literal" &&
    typeof node.arguments[0].value === "string"
  );
}

function isImportString(node) {
  return node && node.parent && node.parent.type === "ImportDeclaration";
}

function isModulePathString(node) {
  return isStaticImportOrRequire(node.parent) || isImportString(node) || false;
}

const HIGH_ENTROPY = "HIGH_ENTROPY";

const PATTERN_MATCH = "PATTERN_MATCH";

module.exports = { shannonEntropy, checkOptions, HIGH_ENTROPY, PATTERN_MATCH, isModulePathString };
