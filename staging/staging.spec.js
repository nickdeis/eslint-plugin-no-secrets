const path = require('path');
const ESLint = require("eslint").ESLint;
const ESLint9 = require("eslint9").ESLint;
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

const FLAT_TESTS = {
    'jsonc-flat.eslintrc.js': JSON_FILES,
    'normal-flat.eslintrc.js': JS_FILES,
    'mixed-flat.eslintrc.js': [].concat(JSON_FILES).concat(JS_FILES) 
}

async function runTests(tests,eslintClazz){
    const configs = Object.entries(tests);
    for(const [config,tests] of configs){
        const eslint = new eslintClazz({overrideConfigFile:path.join(__dirname,config)});
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
}

describe("Staging tests", () => {
    describe('JSON compat testing', async () => {
        runTests(TESTS,ESLint);
    });
    
    describe('Flat config testing', async () => {
        runTests(FLAT_TESTS,ESLint9);
    });
})

