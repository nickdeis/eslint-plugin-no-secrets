import type { ESLint, Rule } from 'eslint';

declare const eslintPluginNoSecrets: ESLint.Plugin & {
    rules: {
        'no-secrets': Rule.RuleModule,
    };
};

export = eslintPluginNoSecrets;