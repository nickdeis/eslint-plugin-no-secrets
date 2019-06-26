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

function compileListOfPatterns(patterns = [], name) {
  if (!Array.isArray(patterns)) {
    if (typeof patterns === "string" || patterns instanceof RegExp) {
      patterns = [patterns];
    } else {
      throw new Error(`Expected '${name}' to be an a array, a string, or a RegExp`);
    }
  }

  const compiledPatterns = [];
  for (let i = 0; i < patterns.length; i++) {
    try {
      compiledPatterns[i] = patterns[i] instanceof RegExp ? patterns[i] : new RegExp(String(patterns[i]));
    } catch (e) {
      throw new Error("Failed to compiled the regexp " + patterns[i]);
    }
  }
  return compiledPatterns;
}

function checkOptions({ tolerance, additionalRegexes, ignoreContent, ignoreModules, ignoreIdentifiers }) {
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

  return {
    tolerance,
    additionalRegexes: compiledRegexes,
    ignoreContent: compileListOfPatterns(ignoreContent),
    ignoreModules,
    ignoreIdentifiers:compileListOfPatterns(ignoreIdentifiers)
  };
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

const VARORPROP = ["AssignmentExpression", "Property", "VariableDeclarator"];

function getPropertyName(node) {
  return node.parent.key && node.parent.key.type === "Identifier" && node.parent.key.name;
}

function getIdentifierName(node) {
  if (!node || !node.parent) return false;
  switch (node.parent.type) {
    case "VariableDeclarator":
      return getVarName(node);
    case "AssignmentExpression":
      return getAssignmentName(node);
    case "Property":
      return getPropertyName(node);
    default:
      return false;
  }
}

function getVarName(node) {
  return node.parent.id && node.parent.id.name;
}

function getAssignmentName(node) {
  return (
    node.parent.left && node.parent.property && node.parent.property.type === "Identifier" && node.parent.property.name
  );
}

const HIGH_ENTROPY = "HIGH_ENTROPY";

const PATTERN_MATCH = "PATTERN_MATCH";

module.exports = { getIdentifierName, shannonEntropy, checkOptions, HIGH_ENTROPY, PATTERN_MATCH, isModulePathString };
