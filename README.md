# compose-cli

`compose-cli` scaffolds a new EmDash project from the blank Compose template.

## What it does

- Copies the template from `assets/templates/blank` into a new project directory.
- Installs dependencies with pnpm.
- Runs the bootstrap step for the new EmDash app.
- Tries to initialize Git so the project starts with a commit-ready working tree.

## Usage

Create a new project:

```bash
pnpm dlx @emdash-compose/compose-cli init my-site
cd my-site
pnpm dev
```

If you are developing the CLI from this repository, build it first and then run the local command:

```bash
pnpm install
pnpm build
pnpm compose init my-site
```

## Result

The generated project includes a working EmDash setup, a blank site template, and the scripts needed to continue with normal Astro development.
