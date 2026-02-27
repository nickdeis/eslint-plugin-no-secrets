/**
 * As of right now, this should not be imported into any file unless you use `import type`
 */
import z from "zod/v4";
import { writeFileSync } from "fs";
import path from "path";

const PatternSchema = z
  .union([
    z.string().describe("A stringified regexp pattern"),
    z.object({}).describe("An instance of RegExp"),
  ])
  .describe("A string/RegExp pattern");
const VarArgPatterns = z
  .union([PatternSchema, z.array(PatternSchema)])
  .describe("A single pattern or an array of patterns")
  .optional()
  .default([]);

const PatternsRecord = z
  .record(z.string(), PatternSchema)
  .optional()
  .default({});
const NoSecretsSchema = z
  .array(
    z
      .object({
        tolerance: z
          .number()
          .positive()
          .optional()
          .default(4)
          .describe(
            `Minimum randomness/entropy allowed. Only strings above this threshold will be shown`,
          ),
        ignoreModules: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            "Ignores strings that are an argument in import() and require() or is the path in an import statement. ",
          ),
        ignoreCase: z
          .boolean()
          .optional()
          .default(false)
          .describe(
            "Ignores character case when calculating entropy. This could lead to some false negatives",
          ),
        ignoreContent: VarArgPatterns.describe(
          "Will ignore the entire string if matched. Expects either a pattern or an array of patterns. This option takes precedent over additionalRegexes and the default regular expressions",
        ),
        ignoreIdentifiers: VarArgPatterns.describe(
          "Ignores the values of properties and variables that match a pattern or an array of patterns.",
        ),
        additionalDelimiters: VarArgPatterns.describe(
          "In addition to splitting the string by whitespace, tokens will be further split by these delimiters",
        ),
        additionalRegexes: PatternsRecord.describe(
          "Object of additional patterns to check. Key is check name and value is corresponding pattern",
        ),
      })
      .optional()
      .describe("Options for no-secrets rule"),
  )
  .optional();

const NoPatternSchema = z
  .array(
    z
      .object({
        patterns: PatternsRecord.describe(
          "An object of patterns to check the text contents of files against",
        ),
      })
      .optional()
      .describe("Options for no-pattern-match rule"),
  )
  .optional();

const basePath = path.join(import.meta.dirname, "..", "src");

function writeSchema(Schema: z.ZodOptional<any>, outFileName: string) {
  let schema = Schema.toJSONSchema({ target: "draft-04" });
  let writeSchemaPath = path.join(basePath, outFileName);
  writeFileSync(writeSchemaPath, JSON.stringify(schema, null, 2));
}

writeSchema(NoSecretsSchema, "no-secrets.schema.json");
writeSchema(NoPatternSchema, "no-pattern-match.schema.json");
