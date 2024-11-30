export declare const DEFAULT_ADDTIONAL_REGEXES: {};
type PlainObject = {
    [key: string | number]: any;
};
export declare function isPlainObject(obj: any): obj is PlainObject;
export declare function plainObjectOption(value: any, name: string, defaultValue: PlainObject): PlainObject;
export declare function validateRecordOfRegex(recordOfRegex: PlainObject): Record<string, RegExp>;
export declare function checkOptions({ tolerance, additionalRegexes, ignoreContent, ignoreModules, ignoreIdentifiers, additionalDelimiters, ignoreCase, }: {
    tolerance: any;
    additionalRegexes: any;
    ignoreContent: any;
    ignoreModules: any;
    ignoreIdentifiers: any;
    additionalDelimiters: any;
    ignoreCase: any;
}): {
    tolerance: number;
    additionalRegexes: Record<string, RegExp>;
    ignoreContent: RegExp[];
    ignoreModules: any;
    ignoreIdentifiers: RegExp[];
    additionalDelimiters: RegExp[];
    ignoreCase: any;
};
/**
 * From https://github.com/dxa4481/truffleHog/blob/dev/truffleHog/truffleHog.py#L85
 * @param {*} str
 */
export declare function shannonEntropy(str: string): number;
export declare function isModulePathString(node: any): boolean;
export declare function getIdentifierName(node: any): false | string;
export declare const HIGH_ENTROPY = "HIGH_ENTROPY";
export declare const PATTERN_MATCH = "PATTERN_MATCH";
export declare const FULL_TEXT_MATCH = "FULL_TEXT_MATCH";
export {};
