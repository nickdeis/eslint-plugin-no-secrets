"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FULL_TEXT_MATCH = exports.PATTERN_MATCH = exports.HIGH_ENTROPY = exports.DEFAULT_ADDTIONAL_REGEXES = void 0;
exports.isPlainObject = isPlainObject;
exports.plainObjectOption = plainObjectOption;
exports.validateRecordOfRegex = validateRecordOfRegex;
exports.checkOptions = checkOptions;
exports.shannonEntropy = shannonEntropy;
exports.isModulePathString = isModulePathString;
exports.getIdentifierName = getIdentifierName;
const MATH_LOG_2 = Math.log(2);
/**
 * Charset especially designed to ignore common regular expressions (eg [] and {}), imports/requires (/.), and css classes (-), and other special characters,
 * which raise a lot of false postives and aren't usually in passwords/secrets
 */
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+=!|*^@~`$%+?\"'_<>".split("");
const DEFAULT_TOLERANCE = 4;
exports.DEFAULT_ADDTIONAL_REGEXES = {};
function isPlainObject(obj) {
    return typeof obj === "object" && obj.constructor === Object;
}
function compileListOfPatterns(patterns = [], name) {
    if (!Array.isArray(patterns)) {
        if (typeof patterns === "string" || patterns instanceof RegExp) {
            patterns = [patterns];
        }
        else {
            throw new Error(`Expected '${name}' to be an a array, a string, or a RegExp`);
        }
    }
    const compiledPatterns = [];
    for (let i = 0; i < patterns.length; i++) {
        try {
            const pattern = patterns[i];
            compiledPatterns[i] =
                pattern instanceof RegExp ? pattern : new RegExp(String(pattern));
        }
        catch (e) {
            throw new Error("Failed to compiled the regexp " + patterns[i]);
        }
    }
    return compiledPatterns;
}
function booleanOption(value, name, defaultValue) {
    //TODO: This is kind of ridiclous check, fix this
    value = value || defaultValue;
    if (typeof value !== "boolean") {
        throw new Error(`The option '${name}' must be boolean`);
    }
    return value;
}
function plainObjectOption(value, name, defaultValue) {
    value = value || defaultValue;
    if (!isPlainObject(value)) {
        throw new Error(`The option '${name}' must be a plain object`);
    }
    return value;
}
function validateRecordOfRegex(recordOfRegex) {
    const compiledRegexes = {};
    for (const regexName in recordOfRegex) {
        if (recordOfRegex.hasOwnProperty(regexName)) {
            try {
                compiledRegexes[regexName] =
                    recordOfRegex[regexName] instanceof RegExp
                        ? recordOfRegex[regexName]
                        : new RegExp(String(recordOfRegex[regexName]));
            }
            catch (e) {
                throw new Error("Could not compile the regexp " +
                    regexName +
                    " with the value " +
                    recordOfRegex[regexName]);
            }
        }
    }
    return compiledRegexes;
}
function checkOptions({ tolerance, additionalRegexes, ignoreContent, ignoreModules, ignoreIdentifiers, additionalDelimiters, ignoreCase, }) {
    ignoreModules = booleanOption(ignoreModules, "ignoreModules", true);
    ignoreCase = booleanOption(ignoreCase, "ignoreCase", false);
    tolerance = tolerance || DEFAULT_TOLERANCE;
    if (typeof tolerance !== "number" || tolerance <= 0) {
        throw new Error("The option tolerance must be a positive (eg greater than zero) number");
    }
    additionalRegexes = plainObjectOption(additionalRegexes, "additionalRegexes", exports.DEFAULT_ADDTIONAL_REGEXES);
    const compiledRegexes = validateRecordOfRegex(additionalRegexes);
    return {
        tolerance,
        additionalRegexes: compiledRegexes,
        ignoreContent: compileListOfPatterns(ignoreContent),
        ignoreModules,
        ignoreIdentifiers: compileListOfPatterns(ignoreIdentifiers),
        additionalDelimiters: compileListOfPatterns(additionalDelimiters),
        ignoreCase,
    };
}
/**
 * From https://github.com/dxa4481/truffleHog/blob/dev/truffleHog/truffleHog.py#L85
 * @param {*} str
 */
function shannonEntropy(str) {
    if (!str)
        return 0;
    let entropy = 0;
    const len = str.length;
    for (let i = 0; i < CHARSET.length; ++i) {
        //apparently this is the fastest way to char count in js
        const ratio = (str.split(CHARSET[i]).length - 1) / len;
        if (ratio > 0)
            entropy += -(ratio * (Math.log(ratio) / MATH_LOG_2));
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
    return (node &&
        node.callee &&
        node.callee.type === "Identifier" &&
        MODULE_FUNCTIONS.indexOf(node.callee.name) !== -1 &&
        node.arguments.length === 1 &&
        node.arguments[0].type === "Literal" &&
        typeof node.arguments[0].value === "string");
}
function isImportString(node) {
    return node && node.parent && node.parent.type === "ImportDeclaration";
}
function isModulePathString(node) {
    return isStaticImportOrRequire(node.parent) || isImportString(node) || false;
}
const VARORPROP = ["AssignmentExpression", "Property", "VariableDeclarator"];
function getPropertyName(node) {
    return (node.parent.key &&
        node.parent.key.type === "Identifier" &&
        node.parent.key.name);
}
function getIdentifierName(node) {
    if (!node || !node.parent)
        return false;
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
    return (node.parent.left &&
        node.parent.property &&
        node.parent.property.type === "Identifier" &&
        node.parent.property.name);
}
exports.HIGH_ENTROPY = "HIGH_ENTROPY";
exports.PATTERN_MATCH = "PATTERN_MATCH";
exports.FULL_TEXT_MATCH = "FULL_TEXT_MATCH";
