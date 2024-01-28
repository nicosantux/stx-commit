# stx-commit

CLI to help write commit messages according to conventional commits.

## Installation

If you want to install `stx-commit` into your project:

npm:

```bash
npm install -D stx-commit
```

pnpm:

```bash
pnpm add -D stx-commit
```

yarn:

```bash
yarn add -D stx-commit
```

bun:

```bash
bun add -D stx-commit
```

Then add into your `package.json`:

```json
{
  "scripts": {
    "commit": "stx-commit"
  }
}
```

## CLI Options

| Option               | Description                                               | Default |
| -------------------- | --------------------------------------------------------- | ------- |
| `-ml` `--max-length` | Max length of each line.                                  | 72      |
| `-e` `--emoji`       | Add the selected commit type emoji into the commit title. | false   |
