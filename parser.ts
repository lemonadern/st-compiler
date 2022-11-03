import { assertEquals } from "https://deno.land/std@0.161.0/testing/asserts.ts";
import { describe, it } from "https://deno.land/std@0.161.0/testing/bdd.ts";
import { Token, TokenValue } from "./types.ts";

type NodeValue = TokenValue;

type ExpressionNodeValue = "CallExpression";
type ExpressionNode = {
  type: ExpressionNodeValue;
  name: TokenValue;
  params: Node[];
};

type LiteralNodeType = "NumberLiteral" | "StringLiteral";
type LiteralNode = { type: LiteralNodeType; value: NodeValue };

type Node = LiteralNode | ExpressionNode;

type AST = { type: "Program"; body: Node[] };

function parser(tokens: Token[]): AST {
  let current = 0;

  function walk(): Node {
    let token = tokens[current];

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
    if (type === "paren" && value == "(") {
      token = tokens[++current];
      const node: ExpressionNode = {
        type: "CallExpression",
        name: token.value,
        params: [],
      };
      token = tokens[++current];

      const { type, value } = token;
      while ((type !== "paren") || (type === "paren" && value !== ")")) {
        node.params.push(walk());
        token = tokens[current];
      }

      // skip closing parenthesis
      current++;
      return node;
    }

    throw new TypeError("Cannot recognize the token type:" + token.type);
  }

  const ast: AST = {
    type: "Program",
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }
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
