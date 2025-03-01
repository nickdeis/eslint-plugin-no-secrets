"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * From https://github.com/dxa4481/truffleHogRegexes/blob/master/truffleHogRegexes/regexes.json
 */
exports.default = {
    "Slack Token": /(xox[p|b|o|a]-[0-9]{12}-[0-9]{12}-[0-9]{12}-[a-z0-9]{32})/,
    "RSA private key": /-----BEGIN RSA PRIVATE KEY-----/,
    "SSH (OPENSSH) private key": /-----BEGIN OPENSSH PRIVATE KEY-----/,
    "SSH (DSA) private key": /-----BEGIN DSA PRIVATE KEY-----/,
    "SSH (EC) private key": /-----BEGIN EC PRIVATE KEY-----/,
    "PGP private key block": /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
    "Facebook Oauth": /[f|F][a|A][c|C][e|E][b|B][o|O][o|O][k|K].*['|\"][0-9a-f]{32}['|\"]/,
    "Twitter Oauth": /[t|T][w|W][i|I][t|T][t|T][e|E][r|R].*['|\"][0-9a-zA-Z]{35,44}['|\"]/,
    GitHub: /[g|G][i|I][t|T][h|H][u|U][b|B].*['|\"][0-9a-zA-Z]{35,40}['|\"]/,
    "Google Oauth": /(\"client_secret\":\"[a-zA-Z0-9-_]{24}\")/,
    "AWS API Key": /AKIA[0-9A-Z]{16}/,
    "Heroku API Key": /[h|H][e|E][r|R][o|O][k|K][u|U].*[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/,
    "Generic Secret": /[s|S][e|E][c|C][r|R][e|E][t|T].*['|\"][0-9a-zA-Z]{32,45}['|\"]/,
    "Generic API Key": /[a|A][p|P][i|I][_]?[k|K][e|E][y|Y].*['|\"][0-9a-zA-Z]{32,45}['|\"]/,
    "Slack Webhook": /https:\/\/hooks.slack.com\/services\/T[a-zA-Z0-9_]{8}\/B[a-zA-Z0-9_]{8}\/[a-zA-Z0-9_]{24}/,
    "Google (GCP) Service-account": /"type": "service_account"/,
    "Twilio API Key": /SK[a-z0-9]{32}/,
    "Password in URL": /[a-zA-Z]{3,10}:\/\/[^\/\\s:@]{3,20}:[^\/\\s:@]{3,20}@.{1,100}[\"'\\s]/,
};
