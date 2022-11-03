export type TokenType = "paren" | "number" | "string" | "name";
export type TokenValue = "(" | ")" | string;
export type Token = { type: TokenType; value: TokenValue };
