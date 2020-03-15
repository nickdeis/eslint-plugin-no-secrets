const exec = require('util').promisify(require('child_process').execFile);
const CLIEngine = require("eslint6").CLIEngine;
const assert = require('assert');


const TESTS = {
    './staging.config.js':[
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


describe('JSON compat testing',() => {
    const configs = Object.entries(TESTS);
    for(const [config,tests] of configs){
        const cli = new CLIEngine(require(config));
        const files = tests.map(test => test.file);
        const {results} = cli.executeOnFiles(files);
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