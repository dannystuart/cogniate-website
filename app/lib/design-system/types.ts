export type TokenGroup = "colors" | "typography" | "gradients";

export type TokenDef = {
  name: string;
  cssVar: string;
  group: TokenGroup;
  baseline: string;
  kind: "color" | "size" | "weight" | "number" | "tracking";
};

export type TokenState = Record<string, string>;
