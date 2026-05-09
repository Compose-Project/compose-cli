import js from "@eslint/js";
import ts from "typescript-eslint";

export default [
    {
        ignores: ["dist/**", "node_modules/**", "*.d.ts"],
    },
    js.configs.recommended,
    ...ts.configs.recommended,
    {
        files: ["src/**/*.{js,mjs,ts}"],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: "module",
            parser: ts.parser,
        },
        rules: {
            "no-console": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/explicit-function-return-types": [
                "warn",
                {
                    allowExpressions: true,
                    allowTypedFunctionExpressions: true,
                },
            ],
        },
    },
];
