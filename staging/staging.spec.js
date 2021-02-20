const path = require('path');
const ESLint = require("eslint").ESLint;
const assert = require('assert');


const TESTS = {
    'jsonc.eslintrc.js':[
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
    ]
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
                    assert.strictEqual(test.errorCount,report.errorCount);
                });
            }
        });
    }
});