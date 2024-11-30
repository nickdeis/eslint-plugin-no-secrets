import type { Rule } from "eslint";
declare const meta: {
    name: string;
    version: string;
};
declare const rules: {
    "no-pattern-match": Rule.RuleModule;
    "no-secrets": Rule.RuleModule;
};
export { meta, rules };
