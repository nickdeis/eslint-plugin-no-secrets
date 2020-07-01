const exec = require('util').promisify(require('child_process').execFile);
const ESLint = require("eslint7").ESLint;
const assert = require('assert');

const WORKING_CONFIG = {
    baseConfig:{
        "plugins": [
            "self"
          ],
          "rules": {
            "self/no-secrets": "error"
          }
    },
    extensions:['.js','.json'] 
}

const BUGGED_CONFIG = {
    baseConfig:{
        "plugins": [
            "self",
            "json",
          ],
          "rules": {
            "self/no-secrets": "error",
            "json/undefined":"error"
          }
    },
    extensions:['.js','.json']
}

const TESTS = [
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



describe('Staged Testing', () => {
    const files = TESTS.map(test => test.file);
    async function testConfig(config){
        const cli = new ESLint(config);
        const results = await cli.lintFiles(files);
        for(let i=0;i < TESTS.length;i++){
            const test = TESTS[i];
            const report = results[i];
            it(test.name,() => {
                assert.strictEqual(test.errorCount,report.errorCount);
            });
        }
    }
    describe('Bugged Config',async () => {
        await testConfig(BUGGED_CONFIG);
    });
    describe('Working Config',async () => {
        await testConfig(WORKING_CONFIG);
    });
})
