/** @type {import("prettier").Config} */
const config = {
  printWidth: 120,
  trailingComma: "all",
  overrides: [
    {
      files: "*.json",
      options: {
        trailingComma: "none",
      },
    },
  ],
};

export default config;
