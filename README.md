# eslint-plugin-no-secrets

An eslint rule that searches for potential secrets/keys in code.

## Usage

`npm i -D eslint-plugin-no-secrets`

*.eslintrc*
```json
{
   "plugins":["no-secrets"],
   "rules":{
       "no-secrets/no-secrets":"error"
   }
}
```

```js
//Found a string with entropy 4.3 : "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva"
const A_SECRET = "ZWVTjPQSdhwRgl204Hc51YCsritMIzn8B=/p9UyeX7xu6KkAGqfm3FJ+oObLDNEva";
//Found a string that matches "AWS API Key" : "AKIAIUWUUQQN3GNUA88V"
const AWS_TOKEN = "AKIAIUWUUQQN3GNUA88V";
```

## Config

Decrease the tolerance for entropy

```json
{
   "plugins":["no-secrets"],
   "rules":{
       "no-secrets/no-secrets":["error",{"tolerance":3.2}]
   }
}
```

Add additional patterns to check for certain token formats.  
Standard patterns can be found [here](./regexes.js)


```json
{
 "plugins": ["no-secrets"],
 "rules": {
   "no-secrets/no-secrets": [
     "error",
     { "additionalRegexes": { "Basic Auth": "Authorization: Basic [A-Za-z0-9+/=]*" } }
   ]
 }
}
```
## When it's really not a secret

Then disable it with
```javascript
// Set of potential base64 characters
// eslint-disable-next-line no-secrets/no-secrets
const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
```
This will tell future maintainers of the codebase that this suspicious string isn't an oversight

## Options

|Option|Description|Default|Type|
|------|-----------|----------------|----|
|tolerance|Maximum "randomness"/entropy allowed|`4`|`number`|
|additionalRegexes|Object of additional patterns to check. Key is check name and value is corresponding pattern |`{}`|`{[regexCheckName:string]:string | RegExp}`|

## Acknowledgements

Huge thanks to [truffleHog](https://github.com/dxa4481/truffleHog) for the inspiration, the regexes, and the measure of entropy.


