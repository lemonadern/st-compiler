import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.161.0/testing/bdd.ts";

type TokenType = "paren" | "number" | "string";
type TokenValue = "(" | ")" | string;
type Token = { type: TokenType; value: TokenValue };

function tokenizer(input: string) {
  let current = 0;
  let tokens: Token[] = [];

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

  it("throws Error when input includes an invalid character", () => {
    assertThrows(() => {
      tokenizer("(|)");
    }, TypeError);
  });
});
