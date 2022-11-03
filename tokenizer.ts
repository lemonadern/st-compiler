import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.161.0/testing/bdd.ts";
import { Token } from "./types.ts";

function tokenizer(input: string) {
  let current = 0;

  // this array is immutable
  const tokens: Token[] = [];

  while (current < input.length) {
    let char = input[current];

    // opening parenthesis
    if (char === "(") {
      tokens.push({
        type: "paren",
        value: "(",
      });

      current++;
      continue;
    }

    // closing parenthesis
    if (char === ")") {
      tokens.push({
        type: "paren",
        value: ")",
      });
      current++;
      continue;
    }

    // whitespaces
    const WHITESPACE = /\s/;
    if (WHITESPACE.test(char)) {
      current++;
      continue;
    }

    // numbers
    const NUMBERS = /[0-9]/;
    if (NUMBERS.test(char)) {
      let value = "";

      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }

      tokens.push({ type: "number", value });
      continue;
    }

    // literal strings
    if (char === '"') {
      let value = "";
      char = input[++current];

      while (char !== '"') {
        value += char;
        char = input[++current];
      }

      char = input[++current];

      tokens.push({ type: "string", value });
      continue;
    }

    // `name`: not literal letters
    const LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = "";

      let count = 0;
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];

        if (count < 3) {
          count++;
        }
        continue;
      }

      tokens.push({ type: "name", value });
      continue;
    }

    throw new TypeError("Invalid character: " + char);
  }
  return tokens;
}

describe("tokenizer", () => {
  it("accepts '('", () => {
    const expect: Token = {
      type: "paren",
      value: "(",
    };
    assertEquals(tokenizer("("), [expect]);
  });

  it("accepts ')'", () => {
    const expect: Token = {
      type: "paren",
      value: ")",
    };
    assertEquals(tokenizer(")"), [expect]);
  });

  it("accepts numbers", () => {
    const expect: Token = {
      type: "number",
      value: "780",
    };
    assertEquals(tokenizer("780"), [expect]);
  });

  it("accepts literal strings", () => {
    const expect: Token = {
      type: "string",
      value: "hi",
    };
    assertEquals(tokenizer('"hi"'), [expect]);
  });

  it("accepts letters as `name`", () => {
    const expect: Token = {
      type: "name",
      value: "add",
    };
    // a "not `name` value" is required at the end of string
    assertEquals(tokenizer("add "), [expect]);
  });

  it("throws Error when input includes an invalid character", () => {
    assertThrows(() => {
      tokenizer("(|)");
    }, TypeError);
  });
});
