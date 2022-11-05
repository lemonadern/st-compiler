// token
export type TokenType = "paren" | "number" | "string" | "name";
export type TokenValue = "(" | ")" | string;
export type Token = { type: TokenType; value: TokenValue };

// node
export type NodeValue = TokenValue;

// node: expression node
export type ExpressionNodeValue = "CallExpression";
export type ExpressionNode = {
  type: ExpressionNodeValue;
  name: TokenValue;
  params: Node[];
};

// node: literal node
export type LiteralNodeType = "NumberLiteral" | "StringLiteral";
export type LiteralNode = { type: LiteralNodeType; value: NodeValue };

export type Node = LiteralNode | ExpressionNode;

// ast
export type AST = { type: "Program"; body: Node[] };
