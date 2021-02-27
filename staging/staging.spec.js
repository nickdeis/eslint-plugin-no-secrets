const path = require('path');
const ESLint = require("eslint").ESLint;
const assert = require('assert');

const JSON_FILES = [
    {
        name:'Should not detect non-secrets',
        file:'./staging/has-no-secret.json',
        errorCount: 0
    },
    {
        name:'Should detect secrets in json files',
        file:'./staging/has-secret.json',
        errorCount: 1
    }
];

const JS_FILES = [
    {
        name:'Should not detect non-secrets',
        file:'./staging/has-no-secret.js',
        errorCount: 0
    },
    {
        name:'Should detect secrets in json files',
        file:'./staging/has-secret.js',
        errorCount: 1
    }
];

const TESTS = {
    'jsonc.eslintrc.js': JSON_FILES,
    'normal.eslintrc.js': JS_FILES,
    'mixed.eslintrc.js': [].concat(JSON_FILES).concat(JS_FILES)
}


describe('JSON compat testing', async () => {
    const configs = Object.entries(TESTS);
    for(const [config,tests] of configs){
        const eslint = new ESLint({overrideConfigFile:path.join(__dirname,config)});
        const files = tests.map(test => test.file);
        const results = await eslint.lintFiles(files);
        describe(config,() => {
            for(let i=0;i < tests.length;i++){
                const test = tests[i];
                const report = results[i];
                it(test.name,() => {
                    assert.strictEqual(test.errorCount,report.errorCount,JSON.stringify(report.messages,null,2));
                });
            }
        });
    }
});