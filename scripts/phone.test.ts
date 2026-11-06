import assert from "node:assert/strict";
import { displayWhatsappNumber, whatsappNumber } from "../src/lib/phone.ts";

const cases: [string, string | null][] = [
  // Argentina, with country code
  ["+54 9 351 555 0101", "5493515550101"],
  ["+54 351 555 0101", "5493515550101"],
  ["5493515550101", "5493515550101"],
  ["+54 9 11 5555 0101", "5491155550101"],
  ["+54 (0351) 15-555-0101", "5493515550101"],
  // Argentina, as people write it locally
  ["351 555 0101", "5493515550101"],
  ["0351 155550101", "5493515550101"],
  ["(0351) 15-555-0101", "5493515550101"],
  ["11 5555 0101", "5491155550101"],
  ["011 15 5555 0101", "5491155550101"],
  ["  351-5550101 ", "5493515550101"],
  // Another country keeps what was typed
  ["+598 99 123 456", "59899123456"],
  ["00 598 99 123 456", "59899123456"],
  // Incomplete or not a number
  ["555 0101", null],
  ["15 5550101", null],
  ["", null],
  ["abc", null],
  ["+54", null],
];

for (const [input, expected] of cases) {
  assert.equal(whatsappNumber(input), expected, `whatsappNumber(${JSON.stringify(input)})`);
}

assert.equal(displayWhatsappNumber("5493515550101"), "+54 9 3515550101");
assert.equal(displayWhatsappNumber("59899123456"), "+59899123456");

console.log(`phone: ${cases.length + 2} tests passed`);
