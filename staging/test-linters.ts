import { ESLint as ESLint7 } from "eslint";
import { ESLint as ESLint9 } from "eslint9";
//@ts-ignore
import { ESLint as ESLint } from "eslint8";
import { ESLint as ESLint10 } from "eslint10";
export type ESLintClass = typeof ESLint;
const ESLint8 = ESLint as ESLintClass;
type LinterTuple = [number, ESLintClass];
export const LEGACY_LINTERS: LinterTuple[] = [
  [7, ESLint7 as ESLintClass],
  [8, ESLint8],
];
export const FLAT_LINTERS: LinterTuple[] = [
  [9, ESLint9],
  [10, ESLint10],
];
export const ALL_LINTERS: LinterTuple[] = LEGACY_LINTERS.concat(FLAT_LINTERS);
export { ESLint9, ESLint10, ESLint7, ESLint8 };
