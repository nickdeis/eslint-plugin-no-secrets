const { isPlainObject } = require("lodash");

const MATH_LOG_2 = Math.log(2);
/**
 * Charset especially designed to ignore common regular expressions (eg [] and {}) and special characters, 
 * which raise a lot of false postives and aren't usually in passwords
 */
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=!|*^@~`$%-+?\"'_<>".split("");
const DEFAULT_TOLERANCE = 4;
const DEFAULT_ADDTIONAL_REGEXES = {};

function checkOptions({ tolerance, additionalRegexes }) {
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
  return { tolerance, additionalRegexes: compiledRegexes };
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



const HIGH_ENTROPY = "HIGH_ENTROPY";

const PATTERN_MATCH = "PATTERN_MATCH";

module.exports = { shannonEntropy, checkOptions,HIGH_ENTROPY,PATTERN_MATCH };
