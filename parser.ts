import {
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { tokenizer } from "./tokenizer.ts";
import { AST, ExpressionNode, Node, Token } from "./types.ts";

function parser(tokens: Token[]): AST {
  let current = 0;

  function walk(): Node {
    let token = tokens[current];
    console.log("%o", token);

    if (token.type === "number") {
      current++;
      return {
        type: "NumberLiteral",
        value: token.value,
      };
    }

    if (token.type === "string") {
      current++;
      return {
        type: "StringLiteral",
        value: token.value,
      };
    }

    const { type, value } = token;
    if (type === "paren" && value === "(") {
      // skip opening parenthesis
      token = tokens[++current];
      const node: ExpressionNode = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };
      console.log("CallExec: %o", token);
      // skip `name` token
      token = tokens[++current];

      // tokenが 即値 あるいは opening parenthesis のとき
      while (
        (token.type !== "paren") ||
        (token.type === "paren" && token.value !== ")")
      ) {
        node.params.push(walk());
        token = tokens[current];
      }

      // skip closing parenthesis
      current++;
      return node;
    }

    throw new TypeError(
      "Cannot recognize the token type: '" + token.type + "' (value: '" +
        token.value + "')",
    );
  }

  const ast: AST = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }
  console.log("ast: %o", ast);
  return ast;
}

Deno.test("Just number Literal", () => {
  const tokens: Token[] = [{
    type: "number",
    value: "11",
  }];

  const expectedAst: AST = {
    type: "Program",
    body: [
      {
        type: "NumberLiteral",
        value: "11",
      },
    ],
  };

  assertEquals(parser(tokens), expectedAst);
});

Deno.test("Just string Literal", () => {
  const tokens: Token[] = [{
    type: "string",
    value: "hi",
  }];

  const expectedAst: AST = {
    type: "Program",
    body: [
      {
        type: "StringLiteral",
        value: "hi",
      },
    ],
  };

  assertEquals(parser(tokens), expectedAst);
});

Deno.test("Just multiple Literal", () => {
  const tokens: Token[] = [
    {
      type: "string",
      value: "hi",
    },
    {
      type: "number",
      value: "11",
    },
  ];

  const expectedAst: AST = {
    type: "Program",
    body: [
      {
        type: "StringLiteral",
        value: "hi",
      },
      {
        type: "NumberLiteral",
        value: "11",
      },
    ],
  };

  assertEquals(parser(tokens), expectedAst);
});

Deno.test("rejects closing parenthesis without opening", () => {
  const tokens: Token[] = [{ type: "paren", value: ")" }];
  assertThrows(() => {
    parser(tokens);
  }, TypeError);
});

Deno.test("rejects just name without opening parenthesis", () => {
  const tokens: Token[] = [{ type: "name", value: "add" }];
  assertThrows(
    () => {
      parser(tokens);
    },
    TypeError,
    "add",
  );
});

Deno.test("accepts '(add 2 3)'", () => {
  const expectedAst: AST = {
    type: "Program",
    body: [
      {
        type: "CallExpression",
        name: "add",
        params: [
          {
            type: "NumberLiteral",
            value: "2",
          },
          {
            type: "NumberLiteral",
            value: "3",
          },
        ],
      },
    ],
  };
  const tokens = tokenizer("(add 2 3)");
  assertEquals(parser(tokens), expectedAst);
});

Deno.test("accepts '(add 2 (subtract 4 2))'", () => {
  const expectedAst: AST = {
    type: "Program",
    body: [
      {
        type: "CallExpression",
        name: "add",
        params: [
          {
            type: "NumberLiteral",
            value: "2",
          },
          {
            type: "CallExpression",
            name: "subtract",
            params: [
              {
                type: "NumberLiteral",
                value: "4",
              },
              {
                type: "NumberLiteral",
                value: "2",
              },
            ],
          },
        ],
      },
    ],
  };
  const tokens = tokenizer("(add 2 (subtract 4 2))");
  assertEquals(parser(tokens), expectedAst);
});
