import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const JOKE = "I don't hate Mondays. I hate that Monday is Friday's invoice.";

const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const outputPath = path.join(outputDir, "entry.txt");

type JokeFacts = {
  joke: string;
  characters: number;
  bytes: number;
  lines: number;
};

function jokeFacts(text: string): JokeFacts {
  return {
    joke: text,
    characters: Array.from(text).length,
    bytes: Buffer.byteLength(text, "utf8"),
    lines: text.split(/\r\n|\r|\n/).length,
  };
}

function fail(message: string): never {
  process.stderr.write(`error: ${message}\n`);
  process.exit(1);
}

function validate(text: string): JokeFacts {
  const facts = jokeFacts(text);
  if (text.trim().length === 0) {
    fail("joke is empty after trimming");
  }
  if (text !== text.trim()) {
    fail("joke must not have leading or trailing whitespace");
  }
  if (facts.lines !== 1) {
    fail(`joke must be a single line, got ${facts.lines} lines`);
  }
  if (facts.characters < 1 || facts.characters > 200) {
    fail(`characters must be in 1..200, got ${facts.characters}`);
  }
  if (facts.bytes < 1 || facts.bytes > 200) {
    fail(`bytes must be in 1..200, got ${facts.bytes}`);
  }
  return facts;
}

mkdirSync(outputDir, { recursive: true });

const facts = validate(JOKE);

const payload = JOKE + "\n";
writeFileSync(outputPath, payload, { encoding: "utf8" });

const written = readFileSync(outputPath);
const expected = Buffer.from(payload, "utf8");
if (!written.equals(expected)) {
  fail("read-back bytes do not match what was written");
}

process.stdout.write(
  `path: ${outputPath}\njoke: ${facts.joke}\ncharacters: ${facts.characters}\nbytes: ${facts.bytes}\nlines: ${facts.lines}\n`,
);
